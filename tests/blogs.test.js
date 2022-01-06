const Page = require("./helpers/page");

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("when logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("can see create from after click on add", async () => {
    const label = await page.getContentsOf("form label");

    expect(label).toEqual("Blog Title");
  });

  describe("and using valid input", async () => {
    beforeEach(async () => {
      await page.type(".title input", "my title");
      await page.type(".content input", "my content");
      await page.click("form button");
    });

    test("and show review page", async () => {
      const text = await page.getContentsOf("h5");

      expect(text).toEqual("Please confirm your entries");
    });

    test("submit fields in db and can see that in web", async () => {
      await page.click("button.green");
      await page.waitFor(".card"); // dade hai ke dar field vared kardim va gharare dar safhe asli(blogs) bebinim dar in dive (class= card) gharar migire pas bayad sabr kone ta dade ha vared db beshe va neshon bede.
      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");

      expect(title).toEqual("my title");
      expect(content).toEqual("my content");
    });
  });

  describe("using invalid input", async () => {
    // dar vaghe chon fielha khalie va submit ro mizanim eeror bayad bede
    beforeEach(async () => {
      await page.click("form button"); // buton zai majmoe form hast
    });

    test("show error in form", async () => {
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text"); //dota yeki hastan faghat az raveshhaye motefavet be on matn error miresim

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("when user not logged in", async () => {
  test("user can not creat blog post", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "my title", content: "my content" }),
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });

  test("user can not see blogs", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });
});
