import React from "react";
import "./App.css";
import { Matches } from "./Matches";
import {AproveDecline} from "./aproveDecline"
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
    if (localStorage["filterMatches"] == undefined) {
      fetchMatches(Page);
    }
    else {
      setMatches(JSON.parse(localStorage["filterMatches"]))
      setCountApproved(JSON.parse(localStorage["aprovedCounter"]))
      setCountDecline(localStorage["declineCounter"])
    }


  }, []);

  React.useEffect(() => {
    if(localStorage["showAproveDecline"] != undefined){
      setApproveDeclineArr(JSON.parse(localStorage["showAproveDecline"]))
    }
    async function fetchMatches(page: Number) {
      let data = await api.getMatches(page)
      if (data.length > 0) {
        if (localStorage["aproved"] != undefined && localStorage["decline"] != undefined) {
          let filterArr = data.filter(x => x.id != JSON.parse(localStorage["aproved"]).find(y => y == x.id) &&
            x.id != JSON.parse(localStorage["decline"]).find(z => z == x.id))
          setMatches(filterArr);
        }
        else if (localStorage["decline"] != undefined) {
          let decliredArr = data.filter(x => x.id != JSON.parse(localStorage["decline"])?.find(y => y == x.id))
          setMatches(decliredArr);
        }
        else if (localStorage["aproved"] != undefined) {
          let aprovedArr = data.filter(x => x.id != JSON.parse(localStorage["aproved"])?.find(y => y == x.id))
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

  const aprovalCounter = (id: String, number: Number) => {
    let filterMatches = matches.filter(x => x.id != id)
    setMatches([...filterMatches])
    localStorage["filterMatches"] = JSON.stringify(filterMatches)
    let filterApproveDecline = matches.find(x => x.id == id)
   if(localStorage["showAproveDecline"] == undefined){
    localStorage["showAproveDecline"] = JSON.stringify([])
   }   
    let AproveDecline =  JSON.parse(localStorage["showAproveDecline"])
    AproveDecline.push(filterApproveDecline)
    localStorage["showAproveDecline"] = JSON.stringify(AproveDecline)
    setApproveDeclineArr(JSON.parse(localStorage["showAproveDecline"]))
   
    if (number == -1) {
      if (localStorage["decline"] == undefined) {
        localStorage["decline"] = JSON.stringify([])
        let declineArr = JSON.parse(localStorage["decline"]);
        declineArr.push(id)
        localStorage["decline"] = JSON.stringify(declineArr)
        localStorage["declineCounter"] = 0
        localStorage["declineCounter"] = +localStorage["declineCounter"] + 1
      }
      else {
        let declineArr = JSON.parse(localStorage["decline"]);
        declineArr.push(id)
        localStorage["decline"] = JSON.stringify(declineArr)
        localStorage["declineCounter"] = +localStorage["declineCounter"] + 1
      }
      setCountDecline(localStorage["declineCounter"])
    }
    else {
      if (localStorage["aproved"] == undefined) {
        localStorage["aproved"] = JSON.stringify([])
        let aprovedArr = JSON.parse(localStorage["aproved"]);
        aprovedArr.push(id)
        localStorage["aproved"] = JSON.stringify(aprovedArr)
        localStorage["aprovedCounter"] = 0
        localStorage["aprovedCounter"] = +localStorage["aprovedCounter"] + +number
      }
      else {
        let aprovedArr = JSON.parse(localStorage["aproved"]);
        aprovedArr.push(id)
        localStorage["aproved"] = JSON.stringify(aprovedArr)
        localStorage["aprovedCounter"] = +localStorage["aprovedCounter"] + +number
      }
      setCountApproved(localStorage["aprovedCounter"])
    }
  }

  return (
    <main>
      <h1>Matches List</h1>
      <a href="#" className="previous" onClick={() => setShowAproveDecline(!showAproveDecline)}>&laquo; approve And decline</a>
      <a href="#" className="previous" onClick={() => setPage(+Page - 1)}>&laquo; Previous</a>
      <a href="#" className="next" onClick={() => setPage(+Page + 1)}>Next &raquo;</a>
      {countApproved == 1 || countApproved == 0 ? <h3> {countApproved} user aprovel  </h3> : <h3> {countApproved} users aprovel</h3>}
      {countDecline == 1 || countDecline == 0 ? <h3> {countDecline} user Decline </h3> : <h3> {countDecline} users Decline</h3>}
     {showAproveDecline && <AproveDecline matches = {approveDeclineArr}/>} 
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
        <Matches matches={matches} search={search} countDecline={countDecline}
          countApproved={countApproved} addScore={(id, score) => addScore(id, score)} callback={(id, number) => aprovalCounter(id, number)} />

      ) : (


        <h2>Loading...</h2>
      )}
    </main>
  );
};
export default App;
