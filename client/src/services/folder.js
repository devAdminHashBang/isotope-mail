import {backendRequest, setFolders} from '../actions/folders';
import {credentialsHeaders, toJson} from './fetch';

export const FolderTypes = Object.freeze({
  INBOX: {serverName: 'INBOX', icon: 'inbox'},
  FOLDER: {serverName: 'na', icon: 'folder'}
})

function processFolders(initialFolders) {
  const folders = [];
  initialFolders.map(folder => {
    if (folder.name.toUpperCase() === FolderTypes.INBOX.serverName) {
      folder.type = FolderTypes.INBOX;
      folders.unshift(folder);
    } else {
      folder.type = FolderTypes.FOLDER;
      folders.push(folder);
    }
    folder.children = processFolders(folder.children);
  });
  return folders;
}

export async function getFolders(dispatch, credentials, loadChildren) {
  let url = new URL('/api/v1/folders', window.location.origin);
  if (process.env.NODE_ENV === 'development') {
    url = new URL('http://localhost:9010/v1/folders');
  }
  if (loadChildren) {
    url.search = new URLSearchParams({loadChildren: true}).toString();
  }
  dispatch(backendRequest());
  return fetch(url, {
    method: 'GET',
    headers: credentialsHeaders(credentials)
  })
    .then(toJson)
    .then(json =>
      dispatch(setFolders(processFolders(json)))
    );
}

