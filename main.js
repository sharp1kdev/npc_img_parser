const puppeteer = require('puppeteer');
const fs = require('fs');
const req = require('request');
const url = 'http://www4.shemsfm.net';

const npcList = fs.readFileSync('mobs.txt', 'utf-8').split('\r\n');

const download = async function(uri, filename, callback){
    req.head(uri, function(err, res, body){
        req(uri).pipe(fs.createWriteStream('img/' + filename + '.png')).on('close', callback);
    });
};

(async (perInstance) => {
    let threads = 0;
    for (let i = 0; i < npcList.length; i+= perInstance) {
        threads++;
        const browser = await puppeteer.launch({headless : true});
        let promises = [];

        for (let j = 0; j < perInstance; j++) {
            let el = i + j;
            if (npcList[el]) {
                let npcId = npcList[el].split('\t')[0];
                promises.push(browser.newPage().then(async (page) => {
                    try
                    {
                        await page.goto(url + '/npc?id=' + npcId);
                        await page.waitForSelector('img.img-responsive');
                        let imagePath = await page.$eval('img.img-responsive', i => i.getAttribute('src'));
                        let imgLink = url + imagePath;
                        await download(imgLink, npcId, () => console.log('[',el,']', 'Saved ' + npcId + '.png'));
                    }
                    catch (e) {}
                }))
            }
        }

        await Promise.all(promises);
        await browser.close();
    }
})(15);
