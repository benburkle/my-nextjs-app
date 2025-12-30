import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  StudyDetail: { id: number };
  Session: { id: number | string; studyId?: number };
  GuideDetail: { id: number };
  GuideEdit: { id: number | string };
  NewGuide: undefined;
  ResourceDetail: { id: number };
  NewResource: undefined;
  ScheduleDetail: { id: number };
  NewSchedule: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Studies: undefined;
  Guides: undefined;
  Resources: undefined;
  Schedules: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}




