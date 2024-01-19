-- | Definition of Dataset
-- | Each DDF dataset defines five collections of data:
-- | Concepts, Metadata, Entities, Datapoints and Synonyms
-- | But for the purpose of this validation application,
-- | we don't have to keep all data into a Dataset object.
-- | with concepts and entities we can validate other collections
-- | so in this module we defined a BaseDataSet with only
-- | concepts and entities. And define functions to validate datapoints etc
-- | with BaseDataSet.

module Data.DDF.BaseDataSet where

import Prelude
import Data.Array as A
import Data.Map (Map)
import Data.Map as M
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Atoms.Identifier as Id
import Data.DDF.Atoms.Value
import Data.DDF.Concept (Concept(..), ConceptType(..))
import Data.DDF.Concept as Conc
import Data.DDF.Entity (Entity(..))
import Data.DDF.Entity as Ent
import Utils (dupsBy)
import Data.Array (groupBy, sortBy, null)
import Data.Array as Arr
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Array.NonEmpty as NEA
import Data.List.NonEmpty as NEL
import Data.Tuple (Tuple(..))
import Data.Either (Either(..))
import Data.Function (on)
import Data.Validation.Issue (Issues, Issue(..))
import Data.Validation.Semigroup (V, andThen, invalid, isValid, toEither)
import Data.Maybe (Maybe(..))
import Data.HashSet (HashSet)
import Data.HashSet as HS
import Data.HashMap (HashMap)
import Data.HashMap as HM
import Data.String.NonEmpty as NES
import Data.List.NonEmpty (NonEmptyList)
import Data.List.NonEmpty as NEL
import Data.DDF.Csv.FileInfo (CollectionInfo(..))

-- Use a dictionary for data, make it easier to query.
type ConceptDict = HashMap Identifier Concept

type EntityDict = HashMap Identifier (HashSet Identifier)

-- | BaseDataSet only stores data which will be useful for validation
newtype BaseDataSet = BaseDataSet
  { concepts :: ConceptDict -- It should be NonEmpty, how to do it?
  , entityDomains :: EntityDict
  }

instance showBaseDataSet :: Show BaseDataSet where
  show (BaseDataSet { concepts, entityDomains }) =
    "concepts: \n"
      <> show concepts
      <> "\nentities: \n"
      <> show entityDomains

-- create :: ConceptDict -> EntityDict -> BaseDataSet
-- create concepts entities =
--     BaseDataSet { concepts, entities }

type BaseDataSetInput =
  { concepts :: Array Concept
  , entities :: Array Entity
  }

-- createConceptDomain :: ConceptDict -> HashSet Identifier
-- createConceptDomain cd =
--   HS.fromFoldable $ M.keys cd

fromConcepts :: Array Concept -> V Issues BaseDataSet
fromConcepts lst =
  let
    dups = dupsBy (compare `on` Conc.getId) lst

    createIssue (Concept d) =
      case d._info of
        Nothing ->
          InvalidItem "" (-1) $
            "multiple definition found for " <> (Id.value d.conceptId)
        Just info ->
          InvalidItem info.filepath info.row $
            "multiple definition found for " <> (Id.value d.conceptId)
  in
    if null dups then
      let
        concepts = HM.fromArray $ map (\x -> Tuple (Conc.getId x) x) lst
        entityDomains = HM.empty
      in
        pure $ BaseDataSet { concepts, entityDomains }
    else
      let
        issues = A.fromFoldable $ map createIssue dups
      in
        invalid issues

-- | adding entity will never fail because duplication is allowed.
appendEntity :: Entity -> BaseDataSet -> BaseDataSet
appendEntity ent@(Entity e) (BaseDataSet ds) =
  let
    domainAndSets = Ent.getDomainAndSets ent
    currentDomains = ds.entityDomains
    eid = e.entityId

    func domain domainMap =
      case HM.lookup domain domainMap of
        Nothing -> HM.insert domain (HS.singleton eid) domainMap
        Just set -> HM.insert domain (HS.insert eid set) domainMap -- TODO: maybe merge duplicates

    newDomainMap = NEL.foldr func currentDomains domainAndSets
  in
    BaseDataSet $ ds { entityDomains = newDomainMap }

notEmptyConcepts :: Array Concept -> V Issues (Array Concept)
notEmptyConcepts lst =
  if null lst then
    invalid [ Issue $ "Data set must have concepts" ]
  else
    pure lst

parseBaseDataSet :: BaseDataSetInput -> V Issues BaseDataSet
parseBaseDataSet { concepts, entities } = ado
  dataset <- notEmptyConcepts concepts
    `andThen` fromConcepts
  in Arr.foldr appendEntity dataset entities

-- Utils

-- getConceptParser :: BaseDataSet -> ValueParser String
-- getConceptParser (BaseDataSet ds) =
--   parseDomainVal $ HS.fromArray $ map Id.value (HM.keys ds.concepts)

-- getDomainParser ::  BaseDataSet -> Identifier -> Maybe (ValueParser String)
-- getDomainParser (BaseDataSet ds) k =
--   case HM.lookup k ds.entityDomains of
--     Nothing -> Nothing
--     Just entList -> Just $ parseDomainVal $ HS.map Id.value entList

-- -- FIXME: how to get parser for string datapoints?
-- getValueParser :: BaseDataSet -> Identifier -> Maybe (ValueParser Number)
-- getValueParser _ _ = Just $ parseNumVal

getConcept :: BaseDataSet -> Identifier -> V Issues Concept
getConcept (BaseDataSet ds) c =
  case HM.lookup c ds.concepts of
    Just x -> pure x
    Nothing -> invalid [ Issue $ "concept not found: " <> Id.value c ]

getConceptIds :: BaseDataSet -> Array Identifier
getConceptIds (BaseDataSet ds) = HM.keys ds.concepts

getDomainSetValues :: BaseDataSet -> Identifier -> HashSet String
getDomainSetValues (BaseDataSet ds) c =
  case HM.lookup c ds.entityDomains of
    Just x -> HS.map Id.value x
    Nothing -> HS.empty

getValueParser :: BaseDataSet -> Identifier -> V Issues (String -> (V Issues Value))
getValueParser d c =
  let
    concept = getConcept d c
  in
    case toEither concept of
      Left errs -> invalid errs
      Right (Concept conc) ->
        case conc.conceptType of
          StringC -> pure parseStrVal
          MeasureC -> pure parseNumVal
          BooleanC -> pure parseBoolVal
          IntervalC -> pure parseStrVal
          EntityDomainC -> pure $ (parseDomainVal c $ getDomainSetValues d c)
          EntitySetC -> pure $ (parseDomainVal c $ getDomainSetValues d c)
          RoleC -> pure parseStrVal
          CompositeC -> pure parseStrVal
          TimeC -> pure parseTimeVal
          (CustomC _) -> pure parseStrVal


updateValueParserWithConstrain :: NonEmptyList ValueParser -> CollectionInfo -> NonEmptyList ValueParser
updateValueParserWithConstrain vps (DataPoints dp) =
  let
    constrains = dp.constrains

    fun vp con =
      case con of
        Nothing -> vp
        Just c -> parseConstrainedDomainVal $ HS.fromArray [ NES.toString c ]
  in
    NEL.zipWith fun vps constrains
updateValueParserWithConstrain vps _ = vps  -- constrain only works for datapoints
