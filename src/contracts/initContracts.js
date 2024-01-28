import { ethers } from 'ethers';
import { curiaFactoryAddress, curiaFactoryABI } from './config';

export const initCuriaFactoryContract = (signerOrProvider) => {
    return new ethers.Contract(curiaFactoryAddress, curiaFactoryABI, signerOrProvider);
};
