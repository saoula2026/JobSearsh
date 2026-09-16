async function testCors(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    const acao = res.headers.get('access-control-allow-origin');
    console.log(url, '->', acao || 'NONE');
  } catch(e) {
    console.log(url, '-> ERROR', e.message);
  }
}
async function run() {
  await testCors('https://remotive.com/api/remote-jobs?limit=1');
  await testCors('https://arbeitnow.com/api/job-board-api');
  await testCors('https://remoteok.com/api');
  await testCors('https://jobicy.com/api/v2/remote-jobs?count=1');
  await testCors('https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=test&format=json&origin=*');
}
run();
