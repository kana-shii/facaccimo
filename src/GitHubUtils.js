import * as GitHub from "github-api";
import * as git from "isomorphic-git"
import * as http from "isomorphic-git/http/node"
import LightningFS from "@isomorphic-git/lightning-fs"

export default class GitHubUtils {
  static createGH(username, pat) {
    return new GitHub({
      username: username,
      password: pat
    });
  }

  static getRepoList(username, pat) {
    let gh = this.createGH(username, pat);
    return gh.getUser().listRepos();
  }

  static createRepo(username, pat, repoName) {
    let gh = this.createGH(username, pat);
    return gh.getUser().createRepo({
      name: repoName,
      description: 'Automatically created repository for cubari.moe'
    });
  }

  static cloneRepo(fullName) {
    const fs = new LightningFS('fs', {wipe: true});
    return git.clone({
      fs: fs,
      http: http,
      dir: '/',
      url: 'https://github.com/' + fullName,
      corsProxy: 'https://cors.isomorphic-git.org'
    })
      .then(() => {
        return fs;
      });
  }

  static commit(promise, fs, message) {
    return promise
      .then(() => {
        return git.commit({
          fs: fs,
          dir: '/',
          author: {
            name: 'Facaccimo',
            email: 'brzozowski.s.piotr@gmail.com'
          },
          message: message
        });
      });
  }

  static push(promise, fs, username, pat) {
    return promise
      .then(() => {
        return git.push({
          fs: fs,
          dir: '/',
          http: http,
          onAuth: () => ({username: username, password: pat})
        });
      });
  }

  static addSeries(name, series, username, pat, fs) {
    return this.push(
      this.commit(
        fs.promises.writeFile('/' + name, JSON.stringify(series, null, 2))
          .then(() => {
            return git.add({
              fs: fs,
              dir: '/',
              filepath: name
            })
          }), fs, 'Update ' + name),
      fs, username, pat);
  }

  static deleteSeries(name, username, pat, fs) {
    return this.push(
      this.commit(
        fs.promises.unlink('/' + name, {})
          .then(() => {
            return git.remove({
              fs: fs,
              dir: '/',
              filepath: name
            });
          }), fs, 'Delete ' + name),
      fs, username, pat);
  }

  static getSeriesUrl(name, repo, fs) {
    return git.currentBranch({
      fs: fs,
      dir: '/'
    })
      .then(value => {
        return 'https://raw.githubusercontent.com/' + repo + '/' + value + '/' + name;
      })
  }
}