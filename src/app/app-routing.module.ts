import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'user-list',
    loadChildren: () => import('./user-list/user-list.module').then( m => m.UserListPageModule)
  },
  {
    path: 'chat-room/:currentUser/:receiverId/:receiver',
    loadChildren: () => import('./chat-room/chat-room.module').then( m => m.ChatRoomPageModule)
  },
  {
    path: 'user-list/:socketId/:socketUserName/:uiid/:fromchat',
    loadChildren: () => import('./user-list/user-list.module').then( m => m.UserListPageModule)
  },
  {
    path: '',
    redirectTo: 'user-list',
    pathMatch: 'full'
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
