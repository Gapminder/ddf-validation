module Test.Main where

import Prelude

import Effect (Effect)
import Effect.Class (liftEffect)
import Effect.Aff (launchAff_)
import Effect.Class.Console (log)
import Main as M
import Node.Path (resolve)
import Test.Spec (pending, describe, describeOnly, it, itOnly, Spec)
import Test.Spec.Assertions
  ( shouldEqual
  , shouldSatisfy
  , shouldNotSatisfy
  , shouldNotContain
  , shouldContain
  , fail
  )
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner (runSpec)
import Data.Validation.Semigroup (isValid, andThen)
import Data.DDF.Atoms.Identifier (parseId, isLongerThan64Chars)
import Data.DDF.Atoms.Identifier as Id
import Data.Validation.Issue (Issue(..), Issues)
import Data.DDF.Csv.FileInfo (parseFileInfo)
import Data.DDF.Csv.CsvFile (parseCsvFile)
import Data.DDF.DataPoint (parseDataPoint)
import Data.DDF.Entity (parseEntity)
import Data.String.CodeUnits (fromCharArray)
import Data.List.Lazy (take, repeat)
import Data.Array as Arr
import Data.Foldable (for_)
import Data.DDF.Concept (ConceptInput, parseConcept)
import Data.DDF.Concept as Conc
import Data.Map as Map
import Data.Tuple (Tuple(..))
import Data.Csv (readCsvs)
import Data.Csv as Csv
import Data.Maybe (Maybe(..), isJust, isNothing, fromJust)
import Data.String.NonEmpty (fromString, unsafeFromString)
import Data.List.NonEmpty (NonEmptyList(..))
import Data.List.NonEmpty as NEL
import Utils (getFiles)

testMain :: Effect Unit
testMain = do
  path <- resolve [] "test/datasets/ddf--test--new"
  M.runMain (path)

main :: Partial => Effect Unit
main = launchAff_ $ runSpec [ consoleReporter ] do
  describe "ddf-validation" do
    describeOnly "new things - low level" do
      it "identifier - lowercase numeric" do
        let
          validIds =
            [ "abc"
            , "a_bc_123"
            , "a"
            ]
        for_ validIds \s -> do
          let output = parseId s
          output `shouldSatisfy` isValid
        let
          inValidIds =
            [ ""
            , "a_bC_123"
            , "B"
            , "a-b-c"
            ]
        for_ inValidIds \s -> do
          let output = parseId s
          output `shouldNotSatisfy` isValid
      it "identifier - should not longer than 64 chars" do
        let
          input = fromCharArray $ Arr.fromFoldable $ take 65 $ repeat 'a'
          output = parseId input `andThen` isLongerThan64Chars
        output `shouldNotSatisfy` isValid
      it "filenames - ddf file" do
        let
          validFiles =
            [ "ddf--concepts.csv"
            , "ddf--concepts--discrete.csv"
            , "ddf--entities--geo.csv"
            , "ddf--entities--geo--country.csv"
            , "ddf--datapoints--indicator--by--geo.csv"
            , "ddf--datapoints--indicator--by--geo-geo--time.csv"
            , "folder/ddf--concepts.csv"
            ]
        for_ validFiles \f -> do
          let output = parseFileInfo f
          output `shouldSatisfy` isValid
        let
          invalidFiles =
            [ "ddf.csv"
            , "datapoints.csv"
            , ".gitignore"
            , "ddf--concepts--main.csv"
            , "ddf--datapoints--indicator--geo.csv"
            ]
        for_ invalidFiles \f -> do
          let output = parseFileInfo f
          output `shouldNotSatisfy` isValid
      it "filenames vs headers" do
        let
          fileName = "ddf--concepts.csv"
          rawCsvContent =
            [ [ "concept", "concept_type", "name" ]
            , [ "geo", "entity_domain", "Geo" ]
            ]
          output = ado
            fileInfo <- parseFileInfo fileName
            in parseCsvFile { fileInfo: fileInfo, csvContent: Csv.create rawCsvContent }
        output `shouldSatisfy` isValid
      it "concept validation - one concept" do
        let
          input = { conceptId: "testing"
                  , conceptType: "measure"
                  , props: Map.fromFoldable [(Tuple
                                              (Id.unsafeCreate "name")
                                              "testing_name")]
                  , _info: Map.empty
                  }
          output = parseConcept input
        output `shouldSatisfy` isValid
      it "entity validation - one entity" do
        let
          input = { entityId: "swe"
                  , entityDomain: unsafeFromString "geo"
                  , entitySet: Nothing
                  , props: Map.empty
                  , _info: Map.empty
                  }
          output = parseEntity input
        output `shouldSatisfy` isValid
      it "datapoint validation - one datapoint" do
        let
          input =
            { indicatorId: unsafeFromString "testing"
            , primaryKeys: fromJust $
                NEL.fromFoldable
                  [ unsafeFromString "geo"
                  , unsafeFromString "time"
                  ]
            , primaryKeyValues: fromJust $
                NEL.fromFoldable
                  [ "chn"
                  , "1990"
                  ]
            , value: "1"
            , _info: Map.empty
            }
          output = parseDataPoint $ input
        output `shouldSatisfy` isValid
      pending "ddf validation - duplicated concepts"


      -- IO things
      it "read csv file" do
        let filename = "test/datasets/ddf--test--new/ddf--concepts.csv"
        output <- readCsvs [ filename ]
        case (output Arr.!! 0) of
          Nothing -> fail "it should not be nothing"
          Just rawcsv ->
            rawcsv.headers `shouldSatisfy` isJust
      it "list all csv files in a folder" do
        let dirname = "test/datasets/ddf--test--new/"
        files <- getFiles dirname [ "etl" ]
        files `shouldContain` (dirname <> "ddf--concepts.csv")
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
      -- pending "entity value as entity name"  -- only for old WS
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
