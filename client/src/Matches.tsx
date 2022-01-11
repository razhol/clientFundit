import React from "react";
import { Match } from "./api";
export const Matches = ({
  matches,
  search,
  countApproved,
  countDecline,
  callback,
  addScore,
}: {
  matches: Match[];
  search: string;
  countApproved: Number;
  countDecline: Number;
  callback: (id: String, arg: Number) => void;
  addScore: (id: String, Score: Number) => void;
}) => {
  const filteredMatches = matches.filter((t) =>

    t.borrower.user.email.toLowerCase().includes(search.toLowerCase()) ||
    (t.borrower.user.firstName.toLowerCase() + " " + t.borrower.user.lastName.toLowerCase()).includes(search.toLowerCase()) ||
    t.companyName.toLowerCase().includes(search.toLowerCase()
    )

  );
  const [addScoreCredit, setAddScoreCredit] = React.useState<Number>(0);

  const matchScore = (score: Number) => {
    if (score >= 679) {
      return { type: "A", color: "green" }
    }
    else if (579 >= score && score < 679) {
      return { type: "B", color: "yellow" }
    }
    else {
      return { type: "C", color: "red" }
    }

  }

  return (
    <ul className="matches">
      {filteredMatches.map((match) => (
        <li key={match.id} className="match">
          <h5 className="title">{match.companyName}</h5>
          <div className="matchScore" style={{ borderColor: matchScore(match.borrower.creditScore).color }}>
            <h5 className="score" style={{ color: matchScore(match.borrower.creditScore).color }}>{matchScore(match.borrower.creditScore).type}</h5>
          </div>
          <div className="matchData">
            <div>
              <p className="userDate">
                <b>Full Name:</b> {match.borrower.user.firstName}{" "}
                {match.borrower.user.lastName}
              </p>
              <p className="userDate">
                <b>Email:</b> {match.borrower.user.email}
              </p>
              <p className="userDate">
                <b>Amount Request: </b> {match.amountReq}
              </p>
              <p className="userDate">
                <b>Balance: </b> {match.borrower.financeData.balance}{" "}
                {match.borrower.financeData.currency}
              </p>
            </div>
            <input onChange={e => setAddScoreCredit(+e.target.value)} type="text" ></input> <br />
            <button onClick={() => addScore(match.id, addScoreCredit)}>add</button> <br />
            <button onClick={() => callback(match.id, + 1)}>Approved</button>
            <button onClick={() => callback(match.id, - 1)}>declired</button>
          </div>
          <footer>
            <div className="meta-data">
              Created At {new Date(match.creationTime).toLocaleString()}
            </div>
          </footer>
        </li>

      ))}
    </ul>
  );
};
