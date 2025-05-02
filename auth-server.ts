import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as SamlStrategy, type Profile } from 'passport-saml';
import fs from 'fs';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'random_secret_here',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new SamlStrategy(
  {
    callbackUrl: 'http://localhost:3001/login/callback',
    entryPoint: 'https://shibidp-test.cit.cornell.edu/idp/profile/SAML2/Redirect/SSO',
    issuer: 'http://localhost:3001/',
    cert: fs.readFileSync('./cornell_cert.pem', 'utf-8'),
    identifierFormat: null
  },
  (profile: Profile | null | undefined, done: (error: any, user?: any) => void) => {
    if (!profile) {
      return done(new Error('Empty SAML profile received'));
    }
    done(null, profile);
  }
));

passport.serializeUser((user: Profile, done) => done(null, user));
passport.deserializeUser((user: Profile, done) => done(null, user));

app.get('/login',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true })
);

app.post('/login/callback',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  (req, res) => {
    // everyone who reaches here is considered admin
    req.session.isAdmin = true;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('http://localhost:5173/');
      }
      res.redirect('http://localhost:5173');
    });
  }
);

app.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: req.user,
      isAdmin: req.session.isAdmin || false
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Error logging out');
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).send('Could not destroy session');
      }

      res.clearCookie('connect.sid');
      res.redirect('http://localhost:5173/logout');
    });
  });
});

app.listen(3001, () => {
  console.log('Auth server running at http://localhost:3001');
});