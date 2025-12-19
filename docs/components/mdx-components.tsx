import { TokenReference } from "@/components/token-reference";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,

  TokenReference,
};
