import React, { useRef, useState } from "react";
import { Input } from "./ui/input";
import { useDebouncedCallback } from "use-debounce";
import { searchTracks } from "@/lib/spotify";
import { catchErrors } from "@/lib/utils";
import SongItem from "@/components/ui/song-item";
import { usePathname } from "next/navigation";
import { Bars } from "react-loader-spinner";
import { X } from "lucide-react";
import clsx from "clsx";

const Search = ({ setShowMenu }) => {
  /**
   * STATE VARIABLES
   * Data is the Spotify data returned by the https://api.spotify.com/v1/me/player/recently-played endpoint
   * Status is the response status
   */
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const inputElement = useRef(null);

  const pathname = usePathname();

  const searchSongs = (term) => {
    // Clear the previous state variables
    setData(null);
    setStatus(null);

    if (term) {
      // console.log(`Searching for ${term}...`);

      const fetchData = async () => {
        const searchResults = await searchTracks(term);
        setData(searchResults.data.tracks);
        setStatus(searchResults.status);
        // console.log("searchResults", searchResults);
      };

      catchErrors(fetchData());
    }
  };

  const searchSelectSong = (song) => {
    // console.log("searchSelectSong: " + song);
    const thisSong = {
      id: song.id,
      albumArt: song.album.images[1].url,
      songName: song.name,
      artists: song.artists,
      albumName: song.album.name
    };
    setSong(thisSong);
    setShowMenu(false);
  };

  const handleSearch = useDebouncedCallback((term) => {
    searchSongs(term);
  }, 300);

  const clearSearch = () => {
    searchSongs("");
  };

  return (
    <section className="flex flex-col items-center gap-1">
      <span className="relative w-full group/field">
        <Input
          ref={inputElement}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
          value={searchTerm}
          className="text-base"
        />
        <span
          className="absolute top-0 right-0 w-10 h-10 opacity-0 cursor-default group-focus-within/field:cursor-pointer group/x group-focus-within/field:opacity-100"
          onClick={(e) => {
            setSearchTerm("");
            clearSearch();
            inputElement.current.focus();
          }}
        >
          <X className="absolute w-4 h-4 rounded-full top-[12px] right-[12px] bg-secondary " />
        </span>
      </span>

      {(data && (
        <div className="w-full md:h-[calc(100dvh-56px-40px-48px-16px-32px-40px)] h-[calc(100dvh-40px-56px-48px-16px-40px)] overflow-y-scroll">
          {data.items.map((item, index) => (
            <SongItem
              // We can't set the key to the song's id because the same song could be in the recently-played list multiple times, so we'll use the index instead
              key={index}
              item={item}
              path={pathname}
              setShowMenu={setShowMenu}
            />
          ))}
        </div>
      )) ||
        (status == 204 && (
          <>
            <p>No content to display.</p>
          </>
        )) ||
        (searchTerm && (
          <>
            <p>Searching for {searchTerm}...</p>
            <Bars
              height="30"
              width="30"
              color="#1fdf64"
              ariaLabel="bars-loading"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </>
        )) || <></>}
    </section>
  );
};

export default Search;
