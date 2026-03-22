import React from 'react';

const BoidsExplanation = () => {
  return (
    <div className="expl-container">
      <h2 className="expl-header">Algorytm Boids</h2>

      <div className="expl-section">
        <div className="expl-subheader">Podstawy</div>
        <span className="expl-title">Dystans Euklidesowy (3D)</span>
        <p>Wszystkie interakcje zależą od odległości między obiektami:</p>
        <div className="math-block">
          d = &radic;( (x<sub>2</sub>-x<sub>1</sub>)&sup2; + (y<sub>2</sub>-y<sub>1</sub>)&sup2; + (z<sub>2</sub>-z<sub>1</sub>)&sup2; )
        </div>
      </div>

      <div className="expl-section">
        <div className="expl-subheader">Zasada 1</div>
        <span className="expl-title">Separacja (Unikanie kolizji)</span>
        <p>Jeśli sąsiad jest zbyt blisko, wektor odpychający jest akumulowany.</p>
        <div className="math-block">
          v<sub>sep</sub> += ( <span className="var-highlight">p<sub>moje</sub></span> - <span className="var-highlight">p<sub>sąsiada</sub></span> ) <br/>
          Zastosowanie: v += v<sub>sep</sub> * <span className="var-highlight">k<sub>sep</sub></span>
        </div>
      </div>

      <div className="expl-section">
        <div className="expl-subheader">Zasada 2</div>
        <span className="expl-title">Wyrównanie (Alignment)</span>
        <p>Dążenie do średniej prędkości sąsiadów w zasięgu wzroku.</p>
        <div className="math-block">
          v<sub>avg</sub> = ( &sum; v<sub>sąsiada</sub> ) / N <br/>
          Zastosowanie: v += (v<sub>avg</sub> - v) * <span className="var-highlight">k<sub>align</sub></span>
        </div>
      </div>

      <div className="expl-section">
        <div className="expl-subheader">Zasada 3</div>
        <span className="expl-title">Spójność (Cohesion)</span>
        <p>Dążenie do środka masy lokalnej grupy sąsiadów.</p>
        <div className="math-block">
          Centrum = ( &sum; p<sub>sąsiada</sub> ) / N <br/>
          Zastosowanie: v += (Centrum - p) * <span className="var-highlight">k<sub>coh</sub></span>
        </div>
      </div>

      <div className="expl-section">
        <div className="expl-subheader">Interakcje</div>
        <span className="expl-title">Ucieczka przed drapieżnikiem</span>
        <p>Jeśli drapieżnik jest w zasięgu, ofiara ucieka w przeciwnym kierunku.</p>
        <div className="math-block">
          v<sub>flee</sub> = <span className="var-highlight">p<sub>ofiara</sub></span> - <span className="var-highlight">p<sub>drapieznik</sub></span> <br/>
          v<sub>ofiara</sub> += v<sub>flee</sub> * 0.5
        </div>

        <span className="expl-title">Polowanie (Logika Drapieżnika)</span>
        <p>Drapieżnik oblicza średnią pozycję ofiar w zasięgu i kieruje się tam.</p>
        <div className="math-block">
          Cel = &sum; p<sub>ofiar</sub> / N <br/>
          v<sub>drapieznik</sub> += (Cel - p<sub>drapieznik</sub>) * 0.03
        </div>
      </div>

      <div className="expl-section">
        <div className="expl-subheader">Środowisko</div>
        <span className="expl-title">Unikanie Przeszkód</span>
        <p>Odbicie od sferycznych przeszkód. Siła działa odwrotnie proporcjonalnie do dystansu.</p>
        <div className="math-block">
          Wektor = (p<sub>boid</sub> - p<sub>obs</sub>) / dist <br/>
          v += Wektor * 0.5
        </div>

        <span className="expl-title">Granice Świata (Soft Bounds)</span>
        <p>Gdy boid zbliża się do ściany sześcianu, jego prędkość jest korygowana w stronę centrum.</p>
        <div className="math-block">
          margin = 5; turnFactor = 0.5 <br/>
          if (x &lt; -rozmiar) vx += turnFactor <br/>
          if (x &gt; rozmiar) vx -= turnFactor
        </div>
      </div>

      <div className="expl-section">
        <div className="expl-subheader">Całkowanie</div>
        <span className="expl-title">Limit Prędkości i Ruch</span>
        <p>Prędkość jest normalizowana (skalowana), jeśli przekracza limity, a następnie dodawana do pozycji.</p>
        <div className="math-block">
          speed = &radic;(vx&sup2; + vy&sup2; + vz&sup2;) <br/>
          if (speed &gt; max) v = (v / speed) * max <br/>
          <br/>
          p<sub>nowe</sub> = p<sub>stare</sub> + (v * <span className="var-highlight">prędkośćSymulacji</span>)
        </div>
      </div>

    </div>
  );
};

export default BoidsExplanation;