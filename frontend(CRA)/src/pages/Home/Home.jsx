import React, { useRef, useState, useEffect } from 'react';
import styles from './Home.module.css';


const Home = () => {
  const teamMembers = [
    { name: 'Schott Watkins', role: 'Web Developer', img: require('../../assets/images/testimonial-1.jpg') },
    { name: 'Nicole Bell', role: 'Mobile Developer', img: require('../../assets/images/testimonial-2.jpg') },
    { name: 'John Doe', role: 'Graphic Designer', img: require('../../assets/images/testimonial-3.jpg') },
    { name: 'Rose Matthews', role: 'Web Designer', img: require('../../assets/images/testimonial-5.jpg') },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const teamRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      const scrollX = teamRef.current.scrollLeft;
      const width = teamRef.current.offsetWidth;
      const index = Math.round(scrollX / width);
      setCurrentSlide(index);
    };
    const el = teamRef.current;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Animated SSF-inspired logo (place above About) */}
      <div className={styles.logoWrap}>
        <svg
          className={styles.ssfLogo}
          viewBox="0 0 220 160"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-labelledby="ssfTitle"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id="ssfTitle">SSF animated ribbon logo</title>

          <defs>
            <linearGradient id="gBlue" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#00bfff" />
              <stop offset="1" stopColor="#0057b7" />
            </linearGradient>

            <linearGradient id="gGreen" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#52ab98" />
              <stop offset="1" stopColor="#1ca53a" />
            </linearGradient>

            <filter id="drop" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.16" />
            </filter>
          </defs>

          {/* back blue ribbon band */}
          <path
            className={`${styles.band} ${styles.bandBlue}`}
            d="M110 8 C85 22,70 54,84 80 C100 108,115 120,110 152 L130 152 C136 118,122 104,104 80 C86 56,106 18,130 8 Z"
            fill="url(#gBlue)"
            filter="url(#drop)"
          />

          {/* front green ribbon band */}
          <path
            className={`${styles.band} ${styles.bandGreen}`}
            d="M104 12 C80 30,68 60,82 86 C98 116,114 126,108 152 L94 152 C100 126,86 116,70 86 C54 56,92 22,110 12 Z"
            fill="url(#gGreen)"
          />

          {/* small right swoosh (accent) */}
          <path
            className={styles.swoosh}
            d="M170 40 C150 30,150 70,170 84 C188 96,205 80,192 64 C180 48,175 48,170 44 Z"
            fill="url(#gBlue)"
          />
        </svg>
      </div>

      {/* About */}
      <section className={styles.about}>
        <h1 className={styles.heading}>about us</h1>
        <div className={styles.row}>
          <div className={styles.content}>
            <h3>We make creativity work for your brand!</h3>
            <p>
              Ours is a team of creatives that is brainstorming on great ideas,
              <b> all. the. time.</b><br />
              With our skills put together, you get an ensemble capable of doing anything and everything your brand needs.
            </p>
            <button className={styles.btn}>Read More</button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className={styles.services}>
        <div className={styles.sectionHead}>
          <h1>Our Services</h1>
          <p>
            We help you to build high-quality digital solutions and products as well as deliver a wide range of related professional services.
          </p>
        </div>
        <div className={styles.servicesGrid}>
          <div className={styles.item}>
            <span className={`${styles.icon} ${styles.feature_box_col_one}`}><i className="fa fa-laptop"></i></span>
            <h6>Web App Development</h6>
            <p>Custom Web Development Services including front-end and back-end solutions.</p>
          </div>
          <div className={styles.item}>
            <span className={`${styles.icon} ${styles.feature_box_col_two}`}><i className="fa fa-android"></i></span>
            <h6>Mobile App Development</h6>
            <p>Cross-platform apps using React Native, Flutter, Xamarin and more.</p>
          </div>
          <div className={styles.item}>
            <span className={`${styles.icon} ${styles.feature_box_col_three}`}><i className="fa fa-magic"></i></span>
            <h6>Digital Marketing</h6>
            <p>Boost your brand presence with targeted online marketing strategies.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <h1 className={styles.heading}>Our Team</h1>
        <div className={styles.teamRow} ref={teamRef}>
          {teamMembers.map((member, i) => (
            <div className={styles.card} key={i}>
              <div className={styles.image}>
                <img src={member.img} alt={member.name} />
              </div>
              <h3>{member.name}</h3>
              <span>{member.role}</span>
              <div className={styles.socialIcons}>
                <i className="fab fa-facebook-f"></i>
                <i className="fab fa-twitter"></i>
                <i className="fab fa-instagram"></i>
                <i className="fab fa-linkedin-in"></i>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.carouselDots}>
          {teamMembers.map((_, idx) => (
            <div
              key={idx}
              className={`${styles.dot} ${currentSlide === idx ? styles.active : ''}`}
            />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <h2>Testimonials</h2>
          <p>See what people have to say about us</p>
        </div>
        <div className={styles.testimonialItem}>
          <div className={styles.testimonialText}>
            <h3>Client Name</h3>
            <h4>CEO, Company</h4>
            <p>SSF Team delivered an excellent product that exceeded expectations!</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;