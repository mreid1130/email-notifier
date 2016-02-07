import subscribeRoutes from './subscribe'
import mediaRoutes from './media'
export default (app) => {
  subscribeRoutes(app);
  mediaRoutes(app);
};
