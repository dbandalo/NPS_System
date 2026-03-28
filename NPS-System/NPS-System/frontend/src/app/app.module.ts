import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { RefreshTokenInterceptor } from './core/interceptors/refresh-token.interceptor';
import { SessionTimeoutInterceptor } from './core/interceptors/session-timeout.interceptor';

// Features (auth / survey / results)
import { LoginComponent } from './features/auth/login/login.component';
import { SurveyComponent } from './features/survey/survey.component';
import { DashboardComponent } from './features/results/dashboard/dashboard.component';

// Shared Components
import { HeaderComponent } from './shared/components/header/header.component';
import { SessionTimerComponent } from './shared/components/session-timer/session-timer.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SurveyComponent,
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
    { provide: HTTP_INTERCEPTORS, useClass: SessionTimeoutInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RefreshTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
