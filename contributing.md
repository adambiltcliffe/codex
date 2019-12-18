## Contributing

If you are interested in contributing to this project, probably best to get in touch directly! Pull requests of any sort are, of course, welcome.

### Notes on contributions:

#### Prettier and jest

Before committing code:

```
$ npm run lint
$ npm run test
```

#### Tests

The existing tests are in something of a mishmash of styles, but for new tests, prefer the style which uses `TestGame.playAction(act)` to the older tests which use `s1 = playAction(s0, act)`.
