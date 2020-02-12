import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import style from './App.module.scss';
import Video from "./Video";

const App = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <h1 className={style.title}>Vieworks Challenge</h1>
        </Toolbar>
      </AppBar>
      <main className={style.main}>
        <Video videoId="S5cCSTONUZ4"></Video>
      </main>
    </>
  );
}

export default App;
