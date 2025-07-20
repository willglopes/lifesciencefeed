// src/components/SearchBar.tsx
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

export default function SearchBar() {
  return (
    <InstantSearch
      indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX!}
      searchClient={searchClient}
    >
      <SearchBox />
      <Hits />
    </InstantSearch>
  );
}
