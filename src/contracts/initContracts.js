import { ethers } from 'ethers';
import { curiaFactoryAddress, curiaFactoryABI, curiaEscrowABI } from './config';

export const initCuriaFactoryContract = (signerOrProvider) => {
    return new ethers.Contract(curiaFactoryAddress, curiaFactoryABI, signerOrProvider);
};

export const initCuriaEscrowContract = (escrowAddress, signerOrProvider) => {
    return new ethers.Contract(escrowAddress, curiaEscrowABI, signerOrProvider);
};
