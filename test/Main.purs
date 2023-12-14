module Test.Main where

import Prelude

import Effect (Effect)
import Effect.Class (liftEffect)
import Effect.Aff (launchAff_)
import Effect.Class.Console (log)
import Main as M
import Node.Path (resolve)
import Test.Spec (pending, describe, it)
import Test.Spec.Assertions (shouldEqual)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner (runSpec)


testMain :: Effect Unit
testMain = do
  path <- resolve [ ] "test/datasets/ddf--test--new"
  M.runMain(path)


main :: Effect Unit
main = launchAff_ $ runSpec [consoleReporter] do
  describe "ddf-validation" do
    -- many of below rules are from old ddf-validation code,
    -- TODO: needs cleanup
    describe "DDF Rules Checking" do
      -- general
      pending "synonym key duplication"
      pending "inconsistent synonym key"
      pending "identifier"
      pending "json field"
      pending "unexpected data"
      -- entity
      pending "concept looks like boolean"
      pending "empty entity id"
      pending "entity value as entity name"
      pending "incorrect boolean entity"
      pending "non unique entity value"
      pending "wrong entity is-- header"
      pending "wrong entity is-- header value"
      pending "unexisting constraint value"
      -- datapoint
      pending "constraints violation"
      pending "duplicated datapoints"
      pending "measure value not numeric"
      pending "unexpected entity value"
      pending "unexpected time value"
      -- concept
      pending "concept id not unique"
      pending "concept mandatory field missing"
      pending "concept not found"
      pending "empty concept id"
      pending "invalid drill up"
      pending "non concept header"
      -- translation
      pending "duplicated translation datapoint key"
      pending "duplicated translation key"
      pending "unexpected translation datapoint data"
      pending "unexpected translation header"
      pending "unexpected translation data"
    describe "Datapackage Rules Checking" do
      pending "not a datapackage"
      pending "wrong datapoint header"
      pending "datapoint without indicator"
      pending "inconsistent data package"
      pending "incorrect field"
      pending "incorrect file"
      pending "incorrect primary key"
      pending "non concept field"
      pending "non unique resource file"
      pending "non unique resource name"
      pending "same key-value concept"
    describe "CLI Features" do
      it "check folder" do
        liftEffect $ testMain
