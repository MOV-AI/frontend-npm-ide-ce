import Links from "./LinkManager";
import Link from "./Link";

test("get a link instance", () => {
  const obj = new Links();

  const id = "5f148e55-38d0-4bbf-a66a-da2c99dd56ae";
  const content = {
    [id]: {
      From: "test2/p2/out",
      To: "test/p1/in"
    }
  };

  obj.setLink({ name: id, content });

  const link = obj.getLink(id);

  expect(link).toBeInstanceOf(Link);
});
