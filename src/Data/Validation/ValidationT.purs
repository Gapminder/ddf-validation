-- | The Validation Transformer
-- which is capable to emit Errors as well as Warnings.
-- We need to use this instead of V because V can not emit warning and
-- continue the computation.

module Data.Validation.ValidationT where

import Prelude

import Control.Monad.Except (class MonadTrans, ExceptT, lift, runExceptT, throwError)
import Control.Monad.State (StateT, modify_, runStateT)
import Data.Either (Either(..), either)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype, over)
import Data.Tuple (Tuple(..))
import Effect.Class (class MonadEffect)
import Control.Monad.Rec.Class (class MonadRec)

-- learn from https://hackage.haskell.org/package/validationt-0.3.0/

newtype ValidationT e m a = ValidationT (ExceptT e (StateT e m) a)

derive instance newtypeVT :: Newtype (ValidationT e m a) _

instance monadtransVT :: MonadTrans (ValidationT e) where
  lift = ValidationT <<< lift <<< lift

derive newtype instance functorVT :: Functor m => Functor (ValidationT e m)

derive newtype instance applyVT :: Monad m => Apply (ValidationT e m)

derive newtype instance applicativeVT :: Monad m => Applicative (ValidationT e m)

derive newtype instance monadVT :: Monad m => Monad (ValidationT e m)

derive newtype instance bindVT :: Monad m => Bind (ValidationT e m)

derive newtype instance monadEffectVT :: MonadEffect m => MonadEffect (ValidationT e m)

derive newtype instance monadRecVT :: MonadRec m => MonadRec (ValidationT e m)

derive newtype instance semigroupVT :: (Monad m, Semigroup a) => Semigroup (ValidationT e m a)

derive newtype instance monoidVT :: (Monad m, Monoid a) => Monoid (ValidationT e m a)

-- | Returns 'mempty' instead of error if no warnings have occurred.
-- Returns 'Nothing' as the second element of tuple if computation was
-- interrupted by 'vError'.
--
-- Returns all concatenated errors and warnings and the result if no
-- errors have occurred (warnings could have occurred).
-- >>> :{
--  runValidationT $ do
--    vWarning ["warning1"]
--    vError ["error"]
--    vWarning ["warning2"]
--    return 8
-- :}
-- (["error","warning1"],Nothing)
--
-- >>> :{
--  runValidationT $ do
--    vWarning ["warning1"]
--    vWarning ["warning2"]
--    return 8
-- :}
-- (["warning1","warning2"],Just 8)
runValidationT :: forall e m a. Monad m => Monoid e => ValidationT e m a -> m (Tuple e (Maybe a))
runValidationT (ValidationT m) = do
  Tuple res warnings <- runStateT (runExceptT m) mempty
  pure
    $ case res of
        Left err -> Tuple (err <> warnings) Nothing
        Right a -> Tuple warnings (Just a)

-- | Like 'runValidationT' but doesn't return the result
-- if any warning has occurred.
runValidationTEither
  :: forall e m a
   . Monoid e
  => Eq e
  => Monad m
  => ValidationT e m a
  -> m (Either e a)
runValidationTEither action = do
  (Tuple err res) <- runValidationT action
  pure
    $ case res of
        Just a
          | err == mempty -> Right a
        _ -> Left err

-- | Like 'runValidationTEither', but takes an error handler instead of
-- returning errors and warnings.
handleValidationT
  :: forall e m a
   . Monoid e
  => Monad m
  => Eq e
  => (e -> m a)
  -> ValidationT e m a
  -> m a
handleValidationT handler action =
  runValidationTEither action >>= either handler pure

-- | Stops further execution and appends the given error.
vError :: forall e m a. Monad m => e -> ValidationT e m a
vError e = ValidationT $ throwError e

-- | Does not stop further execution and appends the given warning.
vWarning :: forall e m. Monad m => Monoid e => e -> ValidationT e m Unit
vWarning e = ValidationT $ modify_ (\x -> x <> e)

-- Alias
type Validation e a = forall m. Monad m => ValidationT e m a
