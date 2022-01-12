import React from "react";
import "./App.css";
import { Matches } from "./Matches";
import { AproveDecline } from "./aproveDecline"
import { createApiClient, Match } from "./api";

export type AppState = {
  matches?: Match[];
  search: string;
};
const api = createApiClient();
const App = () => {
  const [search, setSearch] = React.useState<string>("");
  const [countDecline, setCountDecline] = React.useState<Number>(0);
  const [countApproved, setCountApproved] = React.useState<Number>(0);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [approveDeclineArr, setApproveDeclineArr] = React.useState<Match[]>([]);
  const [Page, setPage] = React.useState<Number>(1);
  const [showAproveDecline, setShowAproveDecline] = React.useState<Boolean>(false);

  React.useEffect(() => {
    async function fetchMatches(page: Number) {
      setMatches(await api.getMatches(page));
    }
    if (localStorage["filterMatchesWithoutDA"] == undefined) {
      fetchMatches(Page);
    }
    else {
      setMatches(JSON.parse(localStorage["filterMatchesWithoutDA"]))
      setCountApproved(JSON.parse(localStorage["aprovedCounter"]))
      setCountDecline(localStorage["declineCounter"])
    }
  }, []);

  React.useEffect(() => {
    if (localStorage["showAproveDecline"] != undefined) {
      setApproveDeclineArr(JSON.parse(localStorage["showAproveDecline"]))
    }
    async function fetchMatches(page: Number) {
      let data = await api.getMatches(page)
      if (data.length > 0) {
        if (localStorage["aprovedIdList"] != undefined && localStorage["declineIdList"] != undefined) {
          let filterArr = data.filter(x => x.id != JSON.parse(localStorage["aprovedIdList"]).find(y => y == x.id) &&
              x.id != JSON.parse(localStorage["declineIdList"]).find(z => z == x.id))
          setMatches(filterArr);
        }
        else if (localStorage["declineIdList"] != undefined) {
          let decliredArr = data.filter(x => x.id != JSON.parse(localStorage["declineIdList"])?.find(y => y == x.id))
          setMatches(decliredArr);
        }
        else if (localStorage["aprovedIdList"] != undefined) {
          let aprovedArr = data.filter(x => x.id != JSON.parse(localStorage["aprovedIdList"])?.find(y => y == x.id))
          setMatches(aprovedArr);
        }
        else {
          setMatches(data);
        }
      }
      else {
        if (page <= 0) {
          setPage(+Page + 1)
        }
        else {
          setPage(+Page - 1)
        }
      }
    }
    fetchMatches(Page);
  }, [Page]);

  let searchDebounce: any;
  const onSearch = (val: string, newPage?: number) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      setSearch(val);
    }, 300);
  };

  const addScore = (id: String, score: Number) => {
    let matchesData = matches
    let index = matchesData.findIndex(x => x.id == id);
    matchesData[index].borrower.creditScore = +matches[index].borrower.creditScore + +score
    setMatches([...matchesData])
  }

  const aprovedDeclineCounter = (id: String, number: Number) => {
    let filterMatches = matches.filter(x => x.id != id)
    setMatches([...filterMatches])
    localStorage["filterMatchesWithoutDA"] = JSON.stringify(filterMatches)
    let filterApproveDecline = matches.find(x => x.id == id)
    if (localStorage["showAproveDecline"] == undefined) {
      localStorage["showAproveDecline"] = JSON.stringify([])
    }
    let AproveDecline = JSON.parse(localStorage["showAproveDecline"])
    AproveDecline.push(filterApproveDecline)
    localStorage["showAproveDecline"] = JSON.stringify(AproveDecline)
    setApproveDeclineArr(JSON.parse(localStorage["showAproveDecline"]))
    if (number == -1) {
      if (localStorage["declineIdList"] == undefined) {
        localStorage["declineIdList"] = JSON.stringify([])
        localStorage["declineCounter"] = 0
      }
      let declineArr = JSON.parse(localStorage["declineIdList"]);
      declineArr.push(id)
      localStorage["declineIdList"] = JSON.stringify(declineArr)
      localStorage["declineCounter"] = +localStorage["declineCounter"] + 1
      setCountDecline(localStorage["declineCounter"])
    }
    else {
      if (localStorage["aprovedIdList"] == undefined) {
        localStorage["aprovedIdList"] = JSON.stringify([])
        localStorage["aprovedCounter"] = 0
      }
        let aprovedArr = JSON.parse(localStorage["aprovedIdList"]);
        aprovedArr.push(id)
        localStorage["aprovedIdList"] = JSON.stringify(aprovedArr)
        localStorage["aprovedCounter"] = +localStorage["aprovedCounter"] + +number
        setCountApproved(localStorage["aprovedCounter"])
    }
  }

  return (
    <main>
      <h1>Matches List</h1>
      <a href="#" className="aproveDeclineButton" onClick={() => setShowAproveDecline(!showAproveDecline)}>approve And decline list</a>
      <a href="#" className="ButtonLeft" onClick={() => setPage(+Page - 1)}>&laquo; Previous</a>
      <a href="#" className="ButtonRight" onClick={() => setPage(+Page + 1)}>Next &raquo;</a>
      {countApproved == 0 ? "" : <h3> {countApproved} users aproveld</h3>}
      {countDecline == 0 ? "" : <h3> {countDecline} users Declined</h3>}
      {showAproveDecline && <AproveDecline matches={approveDeclineArr} />}
      <header>
        <input
          type="search"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </header>
      {matches ? (
        <div className="results">Showing {matches.length} results</div>
      ) : null}
      {matches ? (
        <Matches matches={matches} search={search}  addScore={(id, score) => addScore(id, score)}
         callback={(id, number) => aprovedDeclineCounter(id, number)} />
      ) : (
        <h2>Loading...</h2>
      )}
    </main>
  );
};
export default App;
