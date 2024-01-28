import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { initCuriaFactoryContract } from './contracts/initContracts';

function App() {
    const [escrows, setEscrows] = useState([]);
    const [curiaFactoryContract, setCuriaFactoryContract] = useState(null);
    const [beneficiary, setBeneficiary] = useState(''); // State for beneficiary address input
    const [arbiter, setArbiter] = useState(''); // State for arbiter address input
    const [deadlineInHours, setDeadlineInHours] = useState(''); // State for deadline input

    useEffect(() => {
        const init = async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            console.log("Account:", await signer.getAddress());
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

        const escrows = await curiaFactoryContract.getAllEscrows();
        setEscrows(escrows);
    };

    return (
        <div className="App">
            <h1>Curia Escrow App</h1>

            <input type="text" value={beneficiary} onChange={e => setBeneficiary(e.target.value)} placeholder="Beneficiary Address"/>
            <input type="text" value={arbiter} onChange={e => setArbiter(e.target.value)} placeholder="Arbiter Address"/>
            <input type="text" value={deadlineInHours} onChange={e => setDeadlineInHours(e.target.value)} placeholder="Deadline in Hours"/>

            <button onClick={createEscrow}>Create Escrow</button>

            <div>
                <h2>Existing Escrows</h2>
                {escrows.map((escrow, index) => (
                    <div key={index}>
                        <p>Escrow Address: {escrow}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
