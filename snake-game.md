# Snake Game

## Purpose

* This game is for 5-10 yrs old students whose native language is English to review the Chinese characters we have learnt in the current unit or lessons. The main purpose is to provide a fun environment to learn and review, no need to be competitive and intensive, otherwise they will feel upset and refuse to engage.

# User

* One teacher  
* 1-12 students

## Initial Setup

* This game is similar to the snake game in Nokia phone  
* N by M grid where N, M \> 5, can be specified by the teacher  
* Undo a selection if they choose the wrong picture or list of characters  
* Each cell has a hidden Chinese character  
* Place the snake randomly anywhere in the grid  
* The size of the snake is one cell  
* A character is revealed and chosen randomly.   
* Each cell has one simplified Chinese character.  
* The font is KaiTi  
* Each cell background is a picture of a mouse, I will attach the picture of the mouse to you.  
* Background color is light blue or green for readability   
* Chinese characters are black

## Resources

* A JSON file with a list of characters defined by grade, unit and lesson will be provided for one round of the game

Requirements

* A tutor can see what character list they can choose and they will select one for the game  
* The tutor should be able to determine the grid size and list of characters to use for the game

## Rule

* The snake can move north, south, west, east only. The snake moves 1 cell per second  
* When picking the next character:  
  * pick the character that is about 10 cells away, so the student has 10 seconds to think because the snake moves 1 cell per second  
  * the speed of the snake is adjusted  
  * Do not repeat the same characters that have been revealed already  
* The snake moves automatically taking the one of the shortest paths to the character  
* During the entire duration of the game, there is a pause button and a keyboard shortcut, 'p',  for the tutor to stop the snake’s move and pause the game.   
  * The pause button should not block the game so that the student can still see all the characters.  
  * When the game is paused, there should be a resume button and the game can be resumed by clicking the resume button and a keyboard shortcut 'r'.  
* The student has a chance to read the character before the snake eats the character. If the student successfully reads the character, the tutor will pause and choose the next student and resume the game for the next round.  
* For the next round,   
  * The tutor clicks a 'resume' button, or presses the shortcut 'r'  
  * hide the revealed character, and   
  * the snake size increases by one and carries the character which should be added to the end of the tail and   
  * reveal a new character   
* If the students fail to read the character before the snake eats the character,   
  * The revealed character is added to the end of the tail  
  * The game is paused. The teacher will give the student a second chance by asking the student to read all the characters that have been previously added to the end of the tail. If the student can read all of the previous ones, the teacher will pick the next student to play. When resumed, the next character is revealed and all the characters added to the tail will disappear and the snake is back to the initial set up.  
* After the snake carries 4, 5, or 6 characters, there is an equal chance of a special event happening. Instead of a Chinese character, a bomb is revealed. If the snake reaches the bomb, the game is paused. The teacher will ask the student to read all the characters that have been previously added to the end of the tail. If the student can read all of the previous ones, the bomb disappears, and the teacher will pick the next student to play. When resumed, the next character is revealed and the game continues but the snake will be reset to the initial size of one which means without any character added on the end of the tail.   
* If a game is over and restarted, the cells and characters are shuffled randomly