import Login from "../login/login";
import { Route, BrowserRouter as Router } from "react-router-dom";
import Meetings from "../pages/Meetings";
import Container from "@material-ui/core/Container";
import Registration from "../registration/registration";
import AllStudents from "../allStudentsPage/allStudents";
import NavBar from "./NavBar";
import NewMeeting from "../pages/NewMeeting";
import { useMemo, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { isLoggedIn, loggedInRole } from "../utils";
import MeetingInfo from "../pages/MeetingInfo";
import { makeStyles } from "@material-ui/core";
import Logout from "../pages/Logout";
import { meetingContext } from "../contexts/meetingContext";

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: theme.spacing(3),
  },
}));

function App() {
  const classes = useStyles();
  const [auth, setAuth] = useState({
    userLoggedIn: isLoggedIn(),
    role: loggedInRole(),
  });

  const [filter, setFilter] = useState({
    dates: [],
    session_levels: ["junior_a", "junior_b", "senior"],
  });

  const providerUser = useMemo(() => ({ auth, setAuth }));
  const providerFiler = useMemo(() => ({ filter, setFilter }));
  return (
    <AuthContext.Provider value={providerUser}>
      <meetingContext.Provider value={providerFiler}>
        <Router>
          <NavBar />
          <br />
          <br />
          <br />
          <br />
          <Container fixed className={classes.container}>
            <Route exact path="/" component={Login} />
            <Route
              exact
              path="/signup"
              render={() => <Registration update={false} />}
            />
            <Route
              exact
              path="/profile"
              render={() => <Registration update={true} />}
            />
            <Route exact path="/logout" component={Logout} />
            <Route exact path="/new-meeting" component={NewMeeting} />
            <Route exact path="/meetings" component={Meetings} />
            <Route exact path="/meeting" component={MeetingInfo} />
            <Route exact path="/allStudents" component={AllStudents} />
          </Container>
          <br />
          <br />
          <br />
          <br />
        </Router>
      </meetingContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
