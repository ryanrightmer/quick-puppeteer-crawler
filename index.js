const puppeteer = require("puppeteer");
const fs = require("fs");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    var page = await browser.newPage();
    await page.goto(
      "https://odysseypa.traviscountytx.gov/JPPublicAccess/default.aspx"
    );
    const linkHandlers = await page.$x(
      "//a[contains(text(), 'Court Calendar')]"
    );

    await sleep(1000);
    if (linkHandlers.length > 0) {
      await linkHandlers[0].click();
    } else {
      throw new Error("Link not found");
    }

    await page.waitForSelector("#JudicialOfficer");
    await page.click("#JudicialOfficer");

    await page.waitForSelector("#DateSettingOnBefore");
    // await page.focus("#DateSettingOnBefore");
    //   page.keyboard.type("06/30/2020");

    await page.select("#cboJudOffc", "5846");

    const input = await page.$("#DateSettingOnBefore");
    await input.click({ clickCount: 3 });
    await input.type("06/30/2020");

    const searchButton = await page.$("#SearchSubmit");
    await sleep(1000);
    await searchButton.click();

    await sleep(1000);
    let hrefs = await page.evaluate(() =>
      Array.from(document.body.querySelectorAll("a[href]"), ({ href }) => href)
    );
    hrefs = hrefs.filter((x) => {
      return x.includes("CaseID=");
    });
    for (let i = 0; i < hrefs.length; i++) {
      console.log(i);
      await page.goto(hrefs[i]);
      await sleep(1000);
      let bodyHTML = await page.evaluate(() => document.body.innerHTML);
      var filename = hrefs[i].replace(/[^a-z0-9]/gi, "_").toLowerCase();
      fs.writeFileSync(filename + ".html", bodyHTML);
      page.goBack();
    }

    // await browser.close();
  } catch (err) {}
})();
