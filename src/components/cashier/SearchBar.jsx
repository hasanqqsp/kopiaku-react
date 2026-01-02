import React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ query, onQueryChange }) => {
  return (
    <Paper sx={{ display: "flex", alignItems: "center", px: 1, mb: 1 }}>
      <IconButton disabled>
        <SearchIcon />
      </IconButton>
      <InputBase
        placeholder="Cari produk..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        sx={{ ml: 1, flex: 1 }}
      />
    </Paper>
  );
};

export default SearchBar;
