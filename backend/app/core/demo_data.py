# Demo Starter Data with high-performance playable video streams and classic literature excerpts

DEMO_MOVIES = [
    {
        "type": "movie",
        "title": "Interstellar",
        "genre": "Sci-Fi",
        "rating": 5,
        "description": "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
        "cover_image_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
        "is_favorite": True,
        "personal_notes": "Hans Zimmer's organ score is breathtaking. The depiction of Gargantua is mind-bending.",
        "movie": {
            "release_year": 2014,
            "director": "Christopher Nolan",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        }
    },
    {
        "type": "movie",
        "title": "Inception",
        "genre": "Sci-Fi",
        "rating": 5,
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
        "cover_image_url": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80",
        "is_favorite": True,
        "personal_notes": "Mind-bending multi-layered dream sequences. The spinning totem ending remains iconic.",
        "movie": {
            "release_year": 2010,
            "director": "Christopher Nolan",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        }
    },
    {
        "type": "movie",
        "title": "The Dark Knight",
        "genre": "Action",
        "rating": 5,
        "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        "cover_image_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        "is_favorite": True,
        "personal_notes": "Heath Ledger's performance as the Joker is legendary cinema history.",
        "movie": {
            "release_year": 2008,
            "director": "Christopher Nolan",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        }
    },
    {
        "type": "movie",
        "title": "Spirited Away",
        "genre": "Animation",
        "rating": 5,
        "description": "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
        "cover_image_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        "is_favorite": True,
        "personal_notes": "Studio Ghibli at the absolute peak of imagination and emotional resonance.",
        "movie": {
            "release_year": 2001,
            "director": "Hayao Miyazaki",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
    },
    {
        "type": "movie",
        "title": "Blade Runner 2049",
        "genre": "Sci-Fi",
        "rating": 5,
        "description": "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
        "cover_image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        "is_favorite": False,
        "personal_notes": "Roger Deakins' cinematography is immaculate in every single frame.",
        "movie": {
            "release_year": 2017,
            "director": "Denis Villeneuve",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        }
    },
    {
        "type": "movie",
        "title": "The Matrix",
        "genre": "Sci-Fi",
        "rating": 5,
        "description": "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
        "cover_image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
        "is_favorite": False,
        "personal_notes": "Redefined action cinema and visual effects forever. Keanu Reeves at his most iconic.",
        "movie": {
            "release_year": 1999,
            "director": "Lana & Lilly Wachowski",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        }
    },
    {
        "type": "movie",
        "title": "Pulp Fiction",
        "genre": "Drama",
        "rating": 5,
        "description": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        "cover_image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
        "is_favorite": False,
        "personal_notes": "Non-linear storytelling perfection with razor-sharp dialogue.",
        "movie": {
            "release_year": 1994,
            "director": "Quentin Tarantino",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        }
    },
    {
        "type": "movie",
        "title": "La La Land",
        "genre": "Romance",
        "rating": 4,
        "description": "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
        "cover_image_url": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=600&q=80",
        "is_favorite": False,
        "personal_notes": "Gorgeous colors, fantastic jazz music, and an unforgettable bittersweet ending.",
        "movie": {
            "release_year": 2016,
            "director": "Damien Chazelle",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
        }
    },
    {
        "type": "movie",
        "title": "Planet Earth: Wonders",
        "genre": "Documentary",
        "rating": 5,
        "description": "An awe-inspiring cinematic journey exploring our planet's most breathtaking landscapes, rare wildlife phenomena, and deepest oceanic frontiers.",
        "cover_image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        "is_favorite": True,
        "personal_notes": "Incredible ultra-HD cinematography showing untouched nature and animal migration.",
        "movie": {
            "release_year": 2021,
            "director": "Alastair Fothergill",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4"
        }
    },
    {
        "type": "movie",
        "title": "Grand Prix: Bullrun",
        "genre": "Action",
        "rating": 4,
        "description": "Elite drivers push precision-tuned supercars to absolute aerodynamic limits across iconic mountain passes and night city streets.",
        "cover_image_url": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
        "is_favorite": False,
        "personal_notes": "High-octane sound design and blistering chase choreography.",
        "movie": {
            "release_year": 2020,
            "director": "David Carson",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
        }
    }
]

DEMO_BOOKS = [
    {
        "type": "book",
        "title": "The Adventures of Sherlock Holmes",
        "genre": "Mystery / Detective",
        "rating": 5,
        "description": "A collection of twelve short stories featuring the iconic consulting detective Sherlock Holmes and his companion Dr. John Watson, investigating bizarre and ingenious cases across Victorian London.",
        "cover_image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        "is_favorite": True,
        "personal_notes": "A timeless classic! The Bohemian scandal chapter is especially brilliant.",
        "book": {
            "author": "Arthur Conan Doyle",
            "publication_year": 1892,
            "reading_status": "currently_reading",
            "current_page": 14,
            "total_pages": 307,
            "sample_content": """Chapter I: A Scandal in Bohemia

To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.

He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.

Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his. And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory.

I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention; while Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition, the drowsiness of the drug, and the fierce energy of his own keen nature.

He was still, as ever, deeply attracted by the study of crime, and occupied his immense faculties and extraordinary powers of observation in following out those clues, and clearing up those mysteries which had been abandoned as hopeless by the official police. From time to time I heard some vague account of his doings: of his summons to Odessa in the case of the Trepoff murder, of his clearing up of the singular tragedy of the Atkinson brothers at Trincomalee, and finally of the mission which he had accomplished so delicately and successfully for the reigning family of Holland.

Beyond these signs of his activity, however, which I merely shared with all the readers of the daily press, I knew little of my former friend and companion."""
        }
    },
    {
        "type": "book",
        "title": "Pride and Prejudice",
        "genre": "Romance / Classic",
        "rating": 5,
        "description": "Jane Austen's masterwork exploring romantic entanglements, pride, societal expectations, and misunderstandings between Elizabeth Bennet and Mr. Darcy.",
        "cover_image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
        "is_favorite": True,
        "personal_notes": "Sharp dialogue and enduring wit. Austen's character studies are second to none.",
        "book": {
            "author": "Jane Austen",
            "publication_year": 1813,
            "reading_status": "completed",
            "current_page": 279,
            "total_pages": 279,
            "sample_content": """Chapter 1

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."

"What is his name?"

"Bingley."

"Is he married or single?"

"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"

"How so? How can it affect them?"

"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them." """
        }
    },
    {
        "type": "book",
        "title": "The Time Machine",
        "genre": "Science Fiction",
        "rating": 4,
        "description": "An intrepid scientist constructs a vehicle that propels him into the far distant future, discovering the divergent evolutionary branches of humanity: the gentle Eloi and the underground Morlocks.",
        "cover_image_url": "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
        "is_favorite": False,
        "personal_notes": "Fascinating allegorical commentary on class divides and distant evolution.",
        "book": {
            "author": "H.G. Wells",
            "publication_year": 1895,
            "reading_status": "want_to_read",
            "current_page": 1,
            "total_pages": 118,
            "sample_content": """Chapter 1: The Machine

The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burned brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.

Our chairs, being his patents, embraced and caressed us rather than submitted to be sat upon, and there was that luxurious after-dinner atmosphere when thought roams gracefully free of the trammels of precision. And he put it to us in this way—marking the points with a lean forefinger—as we sat and lazily admired his earnestness over this new paradox (as we thought it) and his fecundity.

"You must follow me carefully. I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception."

"Is not that rather a large thing to expect us to begin upon?" said Filby, an argumentative person with red hair.

"I do not mean to ask you to accept anything without reasonable ground for it. You will soon admit as much as I need from you. You know of course that a mathematical line, a line of thickness nil, has no real existence. They taught you that? Neither has a mathematical plane. These things are mere abstractions."

"That is all right," said the Psychologist.

"Nor, having only length, breadth, and thickness, can a cube have a real existence."

"There I object," said Filby. "Of course a solid body may exist. All real things—"

"So most people think. But wait a moment. Can an instantaneous cube exist?" """
        }
    }
]

