import { render } from "@testing-library/react";
import ArticleCard from "../components/ArticleCard";

const mock = { title: "Test", slug: "test", excerpt: "Excerpt" };

test("renders title and excerpt", () => {
  const { getByText } = render(<ArticleCard article={mock} />);
  expect(getByText("Test")).toBeInTheDocument();
  expect(getByText("Excerpt")).toBeInTheDocument();
});
