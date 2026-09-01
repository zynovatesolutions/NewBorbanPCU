import React from "react";
import { BsSearch } from "react-icons/bs";
import SearchWrapper from "./SearchWrapper";

const Search = ({ Value, setValue, Placeholder }) => {
  return (
    <SearchWrapper>
      <div className="flex border-[1px] w-[300px] border-white items-center gap-x-2 px-3 py-[6px] rounded-full overflow-hidden my-[10px]">
        <BsSearch className="text-[1.2rem] maxWeb1:text-[1.8rem]" />
        <input
          className="outline-none bg-inherit text-white w-full maxWeb1:text-[1.5rem] maxWeb2:text-[1.8rem] maxWeb3:text-[2rem] maxWeb4:text-[2.2rem]"
          placeholder={Placeholder}
          value={Value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </SearchWrapper>
  );
};

export default Search;
