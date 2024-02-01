import './App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { initCuriaFactoryContract } from './contracts/initContracts';
import EscrowInteraction from './components/EscrowInteractions';

function App() {
    const [escrows, setEscrows] = useState([]);
    const [curiaFactoryContract, setCuriaFactoryContract] = useState(null);
    const [userAddress, setUserAddress] = useState('');
    const [beneficiary, setBeneficiary] = useState('');
    const [arbiter, setArbiter] = useState('');
    const [deadlineInHours, setDeadlineInHours] = useState('');

    useEffect(() => {
        const init = async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            setUserAddress(userAddress);

            const curiaFactoryContract = initCuriaFactoryContract(signer);
            setCuriaFactoryContract(curiaFactoryContract);

            const escrows = await curiaFactoryContract.getAllEscrows();
            setEscrows(escrows);
        };

        init();
    }, []);

    const createEscrow = async () => {
        const tx = await curiaFactoryContract.createEscrow(beneficiary, arbiter, deadlineInHours);
        await tx.wait();

        const newEscrows = await curiaFactoryContract.getAllEscrows();
        setEscrows(newEscrows);
    };

    return (
      <div className="app">
          <h1 className="title">Curia Escrow App</h1>

          <div className="input-group">
              <input type="text" value={beneficiary} onChange={e => setBeneficiary(e.target.value)} placeholder="Beneficiary Address" className="input"/>
              <input type="text" value={arbiter} onChange={e => setArbiter(e.target.value)} placeholder="Arbiter Address" className="input"/>
              <input type="text" value={deadlineInHours} onChange={e => setDeadlineInHours(e.target.value)} placeholder="Deadline in Hours" className="input"/>
          </div>

          <button onClick={createEscrow} className="button">Create Escrow</button>

          <div className="escrows">
              <h2>Existing Escrows</h2>
              {escrows.map((escrowAddress, index) => (
                  <div key={index} className="escrow">
                      <p>Escrow Address: {escrowAddress}</p>
                      <EscrowInteraction escrowAddress={escrowAddress} userAddress={userAddress} />
                  </div>
              ))}
          </div>
      </div>
  );
}

export default App;
