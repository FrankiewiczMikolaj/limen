import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, copyFileSync, utimesSync } from 'node:fs';
import { join } from 'node:path';
import { plant, limen, jobDir, jobFile, engineEvents } from '/Users/overment/.overment/.limen-limen-worktrees/2026-10-23-f951-spawn-queues-jobs-until-the-deb31959/test/plant.ts';
import { claimDelivery } from '/Users/overment/.overment/.limen-limen-worktrees/2026-10-23-f951-spawn-queues-jobs-until-the-deb31959/src/job/wake-delivery.ts';

const evidence = '/tmp/limen-s1-rereview-deb31959';
const p = await plant();
const coordDir = join(p.parent, 'coord');
mkdirSync(coordDir);
writeFileSync(join(coordDir, 'task.md'), 'block\n');
const fakeHerdr = join(p.bin, 'herdr');
writeFileSync(fakeHerdr, '#!/usr/bin/env node\nconsole.log(JSON.stringify({result:{}}));\n', {mode:0o755});
const env = {...p.env, LIMEN_HERDR:fakeHerdr, PI_SESSION_ID:'coord'};
const hook = '/Users/overment/.overment/.limen-limen-worktrees/2026-10-23-f951-spawn-queues-jobs-until-the-deb31959/hook/wake.ts';
const coord = spawn(join(p.bin,'pi'), ['--session-dir',join(coordDir,'session'),'--extension',hook,'@'+join(coordDir,'task.md')], {cwd:p.root,env,stdio:'ignore'});
const wait = async (check, name) => {
  const deadline = Date.now()+15000;
  while (!check()) {
    assert.ok(Date.now()<deadline, 'timeout: '+name);
    await new Promise(r=>setTimeout(r,25));
  }
};
let paused = false;
const reports = [];
try {
  console.log('Isolation', JSON.stringify({LIMEN_HOME:env.LIMEN_HOME,HOME:env.HOME,LIMEN_HERDR:env.LIMEN_HERDR}));
  await wait(()=>existsSync(join(coordDir,'fake-blocked-1')), 'coordinator ready');
  for (const mode of ['no-claim', 'stale-unaccepted-claim']) {
    const reading = join(p.parent,'start-reading.json');
    writeFileSync(reading, '{"cpuIdle":10,"memoryFree":80}');
    const run = limen(p,['spawn','--engine','pi','--provider','p','--model','m','--thinking','high','--detached','--label',mode,'say quick'],{env});
    assert.equal(run.status,0,run.stderr);
    assert.match(run.stdout,new RegExp('queued '+mode+':'));
    const id=run.stdout.trim().split('\n').at(-1);
    coord.kill('SIGSTOP'); paused=true;
    await wait(()=>execFileSync('/bin/ps',['-o','state=','-p',String(coord.pid)],{encoding:'utf8'}).includes('T'), 'listener paused');
    writeFileSync(reading,'{"cpuIdle":90,"memoryFree":80}');
    await wait(()=>jobFile(p,id,'state')==='done','queued job finishes');
    const claim = join(jobDir(p,id),'notify/claims/_start.coord');
    if (mode === 'stale-unaccepted-claim') {
      // Native U4's dead-owner fixture: an injection never accepted, with an aged claim and no live heartbeat.
      assert.ok(claimDelivery(jobDir(p,id), '_start.coord', () => true, () => new Promise(()=>{}), {
        blocked() {}, protected() { return false; }, pending() {}, accepted() {}, released() {}
      }));
      const old = new Date(Date.now()-31000);
      utimesSync(claim,old,old);
      assert.ok(!existsSync(join(claim,'accepted')));
    }
    coord.kill('SIGCONT'); paused=false;
    await wait(()=>existsSync(join(jobDir(p,id),'notify/delivered/coord')),'completion wake delivered');
    const wakes = engineEvents(coordDir).filter(e=>e.text?.startsWith('Limen job') && e.text.includes(id));
    const report={mode,id,state:jobFile(p,id,'state'),startNotice:jobFile(p,id,'start-notice'),startReceipt:existsSync(join(jobDir(p,id),'notify/delivered/_start.coord')),startClaimStillExists:existsSync(claim),completionReceipt:existsSync(join(jobDir(p,id),'notify/delivered/coord')),startLines:wakes.filter(e=>e.text.includes(') started after ')).length,wakes};
    reports.push(report);
    copyFileSync(join(jobDir(p,id),'log'),join(evidence,mode+'-job.log'));
    writeFileSync(join(evidence,mode+'-report.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  }
  copyFileSync(join(coordDir,'fake-events.jsonl'),join(evidence,'recovery-events.jsonl'));
  assert.deepEqual(reports.map(r=>r.startLines),[1,1],'every queued start is learned exactly once');
} finally {
  if(paused) coord.kill('SIGCONT');
  coord.kill('SIGTERM');
  await p.cleanup();
}
