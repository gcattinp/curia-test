import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { initCuriaEscrowContract } from '../contracts/initContracts';


const EscrowInteraction = ({ escrowAddress, userAddress }) => {
  const [escrowContract, setEscrowContract] = useState(null);
  const [totalDeposits, setTotalDeposits] = useState('0');
  const [userDeposit, setUserDeposit] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [amountToDepositor, setAmountToDepositor] = useState('');
  const [amountToBeneficiary, setAmountToBeneficiary] = useState('');
  const [depositsDisabled, setDepositsDisabled] = useState(false);
  const [arbiterAddress, setArbiterAddress] = useState('');
  const [depositorAddress, setDepositorAddress] = useState('');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
  const [escrowDeadline, setEscrowDeadline] = useState('');

  useEffect(() => {
    const init = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const escrowContract = initCuriaEscrowContract(escrowAddress, signer);

      setEscrowContract(escrowContract);

      const arbiter = await escrowContract.arbiter();
      const depositor = await escrowContract.depositor();
      const beneficiary = await escrowContract.beneficiary();
      const totalDeposits = await escrowContract.totalDeposits();
      const userDeposit = await escrowContract.deposits(userAddress);
      const depositsDisabled = await escrowContract.depositsDisabled();
      const deadline = await escrowContract.escrowDeadline();
      const deadlineBigInt = BigInt(deadline) * 1000n;

      setArbiterAddress(arbiter);
      setDepositorAddress(depositor);
      setBeneficiaryAddress(beneficiary);
      setTotalDeposits(ethers.formatEther(totalDeposits));
      setUserDeposit(ethers.formatEther(userDeposit));
      setDepositsDisabled(depositsDisabled);
      setEscrowDeadline(new Date(Number(deadlineBigInt)).toLocaleString());
    };

    init();
  }, [escrowAddress, userAddress]);

  const handleDeposit = async () => {
    const tx = await escrowContract.deposit({ value: ethers.parseEther(depositAmount) });
    await tx.wait();
    const newUserDeposit = await escrowContract.deposits(userAddress);
    setUserDeposit(ethers.formatEther(newUserDeposit));
    const newTotalDeposits = await escrowContract.totalDeposits();
    setTotalDeposits(ethers.formatEther(newTotalDeposits));
  };

  const handleSettle = async () => {
    const tx = await escrowContract.settle(ethers.parseEther(amountToDepositor), ethers.parseEther(amountToBeneficiary));
    await tx.wait();
  };

  const handleWithdrawAfterDeadline = async () => {
    const tx = await escrowContract.withdrawAfterDeadline();
    await tx.wait();
  };

  const handleEnableDeposits = async () => {
    const tx = await escrowContract.enableDeposits();
    await tx.wait();
    setDepositsDisabled(false);
  };

  const handleDisableDeposits = async () => {
    const tx = await escrowContract.disableDeposits();
    await tx.wait();
    setDepositsDisabled(true);
  };

  return (
    <div className="escrow-interaction">

      {userAddress === arbiterAddress && (
        <>
          <h2>Escrow</h2>
          <p>Total Deposits: {totalDeposits} ETH</p>
          <p>Deadline: {escrowDeadline}</p>
          <input type="text" value={amountToDepositor} onChange={e => setAmountToDepositor(e.target.value)} placeholder="Amount to Depositor (ETH)" />
          <input type="text" value={amountToBeneficiary} onChange={e => setAmountToBeneficiary(e.target.value)} placeholder="Amount to Beneficiary (ETH)" />
          <button onClick={handleSettle}>Settle Escrow</button>
          <button onClick={handleEnableDeposits} disabled={!depositsDisabled}>Enable Deposits</button>
          <button onClick={handleDisableDeposits} disabled={depositsDisabled}>Disable Deposits</button>
        </>
      )}

      {(userAddress === depositorAddress || userAddress === beneficiaryAddress) && (
        <>
          <h2>Escrow</h2>
          <p>Total Deposits: {totalDeposits} ETH</p>
          <p>Deadline: {escrowDeadline}</p>
          <p>Your Deposits: {userDeposit} ETH</p>
          {!depositsDisabled && (
            <div>
              <input type="text" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="Deposit Amount (ETH)" />
              <button onClick={handleDeposit}>Deposit</button>
            </div>
          )}
          <button onClick={handleWithdrawAfterDeadline}>Withdraw After Deadline</button>
        </>
      )}
    </div>
  );
}

export default EscrowInteraction;
