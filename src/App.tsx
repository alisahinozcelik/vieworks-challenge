import React, { useState } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import style from './style.module.scss';
import Video from "./Video";

const App = () => {

  const [ready, setReady] = useState(false);
  const [ended, setEnded] = useState(false);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <h1 className={style.title}>Vieworks Challenge</h1>
        </Toolbar>
      </AppBar>
      <main className={style.main}>
        <Video videoId="S5cCSTONUZ4" onReady={() => setReady(true)} onEnd={() => setEnded(true)}></Video>
        <div>
          Is Ready: <output>{ready + ''}</output>
        </div>
        <div>
          Is Ended: <output>{ended + ''}</output>
        </div>
      </main>
    </>
  );
}

export default App;
