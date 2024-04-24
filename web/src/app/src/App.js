import React, { useState } from 'react';

import { PageLayout } from './components/auth/PageLayout';
import VM from './components/Vm';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Vulnerability from './components/Vulnerability';
import NetworkConfig from './components/NetworkConfig';
import Package from './components/Package';
import Cpu from './components/Cpu';
import User from './components/User';
import SignIn from './components/SignIn';

/**
* If a user is authenticated the ProfileContent component above is rendered. Otherwise a message indicating a user is not authenticated is rendered.
*/
const MainContent = () => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const isAdmin = sessionStorage.getItem("isAdmin");

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<SignIn />
            }
          ></Route>
          {isLoggedIn && <Route
            path="/vm"
            element={<VM />
            }
          ></Route>}
          {isLoggedIn && <Route
            path="/network"
            element={<NetworkConfig />
            }
          ></Route>}
          {isLoggedIn && <Route
            path="/vulnerability"
            element={<Vulnerability />
            }
          ></Route>}
          {isLoggedIn && <Route
            path="/software"
            element={<Package />
            }
          ></Route>}
          {isLoggedIn && <Route
            path="/cpu"
            element={<Cpu />
            }
          ></Route>}
          {isLoggedIn && <Route
            path="/user"
            element={<User />
            }
          ></Route>}
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default function App() {
  return (
    <PageLayout>
      <MainContent />
    </PageLayout>
  );
}