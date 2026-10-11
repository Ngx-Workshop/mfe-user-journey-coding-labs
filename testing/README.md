# Learner behavior tests

Specs mirror src/app beneath testing/app. Fixtures live in testing/fixtures and never enter runtime. Run `npm test -- --watch=false --browsers=ChromeHeadless`.

HTTP double tests cover catalog/search/loading/empty/error, history preservation, saved revisions, duplicate-sensitive commands, chained save/submission, failed saves, runner failure/retry and completed results without published content. These do not establish production auth or gateway behavior. Backend HTTP tests use disposable local Mongo databases; a separate local browser run also verified real Docker grading.
