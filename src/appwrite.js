import { Client, Account, Databases } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://appbuild.store/v1')
  .setProject('69412cbb001cc3accbb8');

export const account = new Account(client);
export const databases = new Databases(client);
export { client };
