import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Feature Modules
import { LoginComponent } from './features/login/login.component';
import { VotingComponent } from './features/voting/voting.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

// Shared Components
import { HeaderComponent } from './shared/components/header/header.component';
import { SessionTimerComponent } from './shared/components/session-timer/session-timer.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    VotingComponent,
    DashboardComponent,
    HeaderComponent,
    SessionTimerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
