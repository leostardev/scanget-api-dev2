let SlackWebhook = require('slack-webhook');
let git = require('git-last-commit');
let slack = new SlackWebhook('https://hooks.slack.com/services/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s', {
  defaults: {
    username: 'Build Bot',
    channel: '#logs_build'
  }
});
let branch = process.env.BITBUCKET_BRANCH;
let owner = branch.split('-')[0];
let apiDocUrl = 'http://api-doc.ap-southeast-1.elasticbeanstalk.com';

console.log(`BRANCH:  ${branch}`); // eslint-disable-line no-console
console.log(`OWNER:   ${owner}`); // eslint-disable-line no-console

git.getLastCommit(function (err, commit) {
  if (err) {
    console.log(err); // eslint-disable-line no-console
  }
  slack.send(
    `\n\n` +
    ` :loudspeaker: News Everyone !\n\n` +
    ` :point_right: From the *API Team*\n\n` +
    ` :male-technologist: Just updated his scannget API Server\n\n` +
    `> :package: ${branch}\n` +
    `> :label: ${commit.subject}\n` +
    `> :link: <${apiDocUrl}|API DOC (global)> \n` +
    `> :lock: _apiuser_ : _apipass_ \n\n`
  );
});
