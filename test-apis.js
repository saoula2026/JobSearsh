async function testApis() {
  try {
    console.log('--- REMOTIVE ---');
    const remotive = await fetch('https://remotive.com/api/remote-jobs?limit=1').then(res => res.json());
    console.log(JSON.stringify(remotive.jobs[0], null, 2));
  } catch(e) { console.error('Remotive error', e) }

  try {
    console.log('--- ARBEITNOW ---');
    const arbeitnow = await fetch('https://arbeitnow.com/api/job-board-api').then(res => res.json());
    console.log(JSON.stringify(arbeitnow.data[0], null, 2));
  } catch(e) { console.error('Arbeitnow error', e) }

  try {
    console.log('--- REMOTEOK ---');
    const remoteok = await fetch('https://remoteok.com/api').then(res => res.json());
    console.log(JSON.stringify(remoteok[1], null, 2)); // 0 is usually a legal warning object
  } catch(e) { console.error('RemoteOK error', e) }

  try {
    console.log('--- JOBICY ---');
    const jobicy = await fetch('https://jobicy.com/api/v2/remote-jobs?count=1').then(res => res.json());
    console.log(JSON.stringify(jobicy.jobs[0], null, 2));
  } catch(e) { console.error('Jobicy error', e) }
}
testApis();
