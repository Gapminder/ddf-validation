module Data.DDF.Concept where

import Prelude

import Data.DDF.Internal (ItemInfo)
import Data.DDF.Atoms.Identifier (Identifier)
import Data.DDF.Atoms.Identifier as Id
import Data.Validation.Issue (Issues, Issue(..))
import Data.List (elem)
import Data.Map (Map)
import Data.Map as M
import Data.Map.Extra (mapKeys)
import Data.Maybe (Maybe(..))
import Data.Newtype (unwrap)
import Data.String as Str
import Data.String.NonEmpty (NonEmptyString, toString)
import Data.Validation.Semigroup (V, andThen, invalid)
import Data.DDF.Atoms.Value (Value, parseStrVal', isEmpty)

-- | Each Concept MUST have an Id and concept type.
-- Other properties is a Map
newtype Concept = Concept
  { conceptId :: Identifier
  , conceptType :: ConceptType
  , props :: Props
  , _info :: Maybe ItemInfo -- additional information used in the app, not in DDF data model
  }

instance eqConcept :: Eq Concept where
  eq (Concept a) (Concept b) = a.conceptId == b.conceptId

instance showConcept :: Show Concept where
  show (Concept a) = show a

-- | Properties type
-- the Key MUST be valid identifier
type Props = Map Identifier Value

-- | Types of concept
data ConceptType
  = StringC
  | MeasureC
  | BooleanC
  | IntervalC
  | EntityDomainC
  | EntitySetC
  | RoleC
  | CompositeC
  | TimeC
  | CustomC Identifier -- The custom type

instance showConceptType :: Show ConceptType where
  show StringC = "string"
  show MeasureC = "measure"
  show BooleanC = "boolean"
  show IntervalC = "interval"
  show EntityDomainC = "entity_domain"
  show EntitySetC = "enitty_set"
  show RoleC = "role"
  show CompositeC = "composite"
  show TimeC = "time"
  show (CustomC x) = "custom type: " <> Id.value x

derive instance eqConceptType :: Eq ConceptType

-- | parse concept type from string
parseConceptType :: String -> V Issues ConceptType
parseConceptType x = ado
  cid <- Id.parseId x
  let
    res = case toString $ unwrap cid of
      "string" -> StringC
      "measure" -> MeasureC
      "boolean" -> BooleanC
      "interval" -> IntervalC
      "entity_domain" -> EntityDomainC
      "entity_set" -> EntitySetC
      "role" -> RoleC
      "composite" -> CompositeC
      "time" -> TimeC
      _ -> CustomC cid
  in res

-- | reserved keywords which can not used as concept id
reservedConcepts :: Array Identifier
reservedConcepts = map Id.unsafeCreate [ "concept", "concept_type", "drill_up", "domain" ]

-- | create concept
concept :: Identifier -> ConceptType -> Props -> Concept
concept conceptId conceptType props = Concept { conceptId, conceptType, props, _info }
  where
  _info = Nothing

-- | set additional infos
setInfo :: (Maybe ItemInfo) -> Concept -> Concept
setInfo info (Concept c) = Concept (c { _info = info })

-- | get concept id
getId :: Concept -> Identifier
getId (Concept x) = x.conceptId


-- | The unvalidated concept record.
type ConceptInput =
  { conceptId :: String
  , conceptType :: String
  , props :: Map Identifier String
  , _info :: Maybe ItemInfo
  }

-- | some concept type require a column exists
-- | for example if concept type is entity_set, then it
-- | must have non empty domain.
checkMandatoryField :: Concept -> V Issues Concept
checkMandatoryField input@(Concept c) = case c.conceptType of
  EntitySetC -> ado
    hasFieldAndGetValue "domain" c.props
      `andThen`
        nonEmptyField "domain"
    in input
  _ -> pure input

hasFieldAndGetValue :: String -> Props -> V Issues Value
hasFieldAndGetValue field input =
  case M.lookup (Id.unsafeCreate field) input of
    Nothing -> invalid [ Issue $ "field " <> field <> " MUST exist for concept" ]
    Just v -> pure v

nonEmptyField :: String -> Value -> V Issues Value
nonEmptyField field input =
  if isEmpty input then
    invalid [ Issue $ "field " <> field <> " MUST not be empty" ]
  else
    pure input

hasProp :: String -> Props -> Boolean
hasProp f props = M.member (Id.unsafeCreate f) props

-- | WS server have issue when concept Id is too long
conceptIdTooLong :: Concept -> V Issues Concept
conceptIdTooLong conc@(Concept c) = ado
  Id.isLongerThan64Chars c.conceptId
  in
    conc

-- | check if concept id is not reversed keyword
notReserved :: String -> V Issues String
notReserved conceptId =
  if conceptId `elem` reservedConcepts_ then
    invalid [ Issue $ "concept/concept_type can not be used as concept id" ]
  else
    pure conceptId
  where
    reservedConcepts_ = map Id.value reservedConcepts

-- | convert a ConceptInput into valid Concept or errors
parseConcept :: ConceptInput -> V Issues Concept
parseConcept input =
  let
    conceptId = notReserved input.conceptId
      `andThen` Id.parseId
    conceptType = parseConceptType input.conceptType
    props = map parseStrVal' input.props

  in
    (concept <$> conceptId <*> conceptType <*> pure props)
      `andThen`
        checkMandatoryField
      `andThen`
        (\c -> pure $ setInfo input._info c)

-- TODO:
-- parseConceptWithValueParsers :: create valid concept, then parse property columns.

-- | unsafe create, useful for testing.
unsafeCreate :: String -> String -> Map String String -> ItemInfo -> Concept
unsafeCreate concept_id concept_type props_ info =
  Concept
    { conceptId: conceptId
    , conceptType: conceptType
    , props: props
    , _info: Just info
    }
  where
  conceptId = Id.unsafeCreate concept_id
  conceptType = unsafeCreateConceptType concept_type
  props = map parseStrVal' <<< mapKeys Id.unsafeCreate $ props_

unsafeCreateConceptType :: String -> ConceptType
unsafeCreateConceptType x =
  case x of
    "string" -> StringC
    "meaeure" -> MeasureC
    "bollean" -> BooleanC
    "interval" -> IntervalC
    "entity_domain" -> EntityDomainC
    "entity_set" -> EntitySetC
    "role" -> RoleC
    "composite" -> CompositeC
    "time" -> TimeC
    _ -> CustomC $ Id.unsafeCreate x
