const puppeteer = require("puppeteer");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
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
    console.log(hrefs);
    hrefs = hrefs.filter((x) => {
      console.log(x, x.includes("CaseID"));
      return x.includes("CaseID=");
    });
    console.log(hrefs);
    for (let i = 0; i < hrefs.length; i++) {
      console.log(i);
      await page.goto(hrefs[i]);
      await sleep(1000);
      let bodyHTML = await page.evaluate(() => document.body.innerHTML);
      console.log(bodyHTML);
      page.goBack();
    }

    // await browser.close();
  } catch (err) {}
})();
