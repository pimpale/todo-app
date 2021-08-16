import {ApiKey} from '@innexgo/frontend-auth-api';
import Branding from '../components/Branding';

export default interface AuthenticatedComponentProps {
  branding: Branding,
  apiKey: ApiKey,
  setApiKey: (data: ApiKey | null) => void,
}
