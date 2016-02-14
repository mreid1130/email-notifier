import subscribeRoutes from './subscribe';
import mediaRoutes from './media';
import userRoutes from './user';
export default (app) => {
  subscribeRoutes(app);
  mediaRoutes(app);
  userRoutes(app);
};
