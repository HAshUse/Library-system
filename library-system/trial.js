let newBook = document.querySelector("#toggle-form");
let form = document.querySelector("#book-form");
let formToggleBtn = document.querySelector(".toggle-btn");
let select = document.querySelector("#type");
let section = document.querySelector(".add-book-section");
let ebookDetails = document.querySelector("#ebook-details")
let filesize = document.querySelector("#fileSize");


// to show the form when add new book is clicked            
formToggleBtn.addEventListener("click", () => {
    // section.style.display = "block";
    if (section.style.display === "none") {
        section.style.display = "block";
        formToggleBtn.textContent = "Hide Form";
    } else {
        section.style.display = "none";
        formToggleBtn.textContent = "Add New Book";
    }
});

// changing book from ebook to physical
select.addEventListener("change", () => {
    ebookDetails.style.display = select.value === "ebook" ? "block" : "none";
});



// create a class of book
class Books {
    constructor(title, author) {
        this.title = title;
        this.author = author;
        this.id = String(Date.now() + Math.floor(Math.random() * 10000));
        this.isAvailable = true;
        this.borrower = null;
        this.type = "physical";
    }

    // create bookcards dynamically
    getHtml() {
        const statusClass = this.isAvailable ? "" : "borrowed";

        return `

       <div class="book-card ${statusClass}" data-id="${this.id}" draggable="true" >
       <h3  class="book-title">${this.title}</h3>
       <div class="book-meta">Author: ${this.author}</div>
       <div class="book-meta">
       Status: ${this.isAvailable ? "Available" : `Borrowed by ${this.borrower}`
            }
       </div>
       <div class="book-actions">${this.isAvailable
                ? '<button class="btn btn-borrow">Borrow</button>'
                : '<button class="btn btn-return">Return</button>'
            }
       <button class="btn btn-remove">Remove</button>
       </div>
       </div>
       `;
    }

}

class Ebook extends Books {

    constructor(title, author, filesize) {
        super(title, author);
        this.filesize = filesize;
        this.type = "ebook";
    }

    getHtml() {
        const statusClass = this.isAvailable ? "" : "borrowed";

        return `

       <div class="book-card ebook" data-id="${this.id}" draggable="true" >
       <h3  class="book-title">${this.title}</h3>
       <div class="book-meta">Author: ${this.author}</div>
       <div class="book-meta">File Size : ${this.filesize} MB </div>
       <div class="book-meta">
       Status: ${!this.borrower ? "Available" : `Downloaded by ${this.borrower}`
            }
       </div>
       <div class="book-actions">${!this.borrower
                ? '<button class="btn btn-borrow">Download</button>'
                : '<button class="btn btn-return">Return</button>'
            }
       <button class="btn btn-remove">Remove</button>
       </div>
       </div>
       `;
    }

}

class Library {
    constructor() {
        this.books = [];        //empty array
        this.loadBooks();
        if (this.books.length === 0) {
            this.addDefaultBooks()
            this.saveBooks();
        }
    }
    //method to show default books on the page
    addDefaultBooks() {
        const defaultBooks = [
            new Books("To kill a mockingbird", "harper Lee"),
            new Books("1984", "George Orwell"),
            new Books("The Great Gatsby", "F.Scott Fitzgerland"),
            new Books("Pride and Prejudice", "Jane Austen")
        ];

        const defaultEBooks = [
            new Ebook("The Digital Age", "Mark Stevenson", 3.5),
            new Ebook("The Digital zone", "Mark Stevenson", 3.5),
            new Ebook("Artificial Intelligence", "Alan Turing", 3.5)
        ];

        // load books into array
        [...defaultBooks, ...defaultEBooks].forEach((book) => {
            this.books.push(book);
        });
        this.saveBooks();

    }
    // add new book
    addBook(book) {
        this.books.push(book);
        this.saveBooks();
        this.displayBooks();
    }

    // save books to local storage
    saveBooks() {
        localStorage.setItem("books", JSON.stringify(this.books));
    }

    // Method to load books from localStorage
    loadBooks() {
        const savedBooks = localStorage.getItem("books"); // Retrieve saved books string
        // console.log("I am retrievd data from local storage", savedBooks)
        if (savedBooks) {
            const bookObjects = JSON.parse(savedBooks); // Parse the JSON string
            // console.log("I am the book object from local storage", bookObjects);
            const book = bookObjects[0]
            // console.log(book instanceof Books)
            // Re-instantiate Book or EBook objects from the plain objects
            this.books = bookObjects.map((obj) => {
                if (obj.type === "ebook") {
                    // Create EBook instance
                    const ebook = new Ebook(obj.title, obj.author, obj.filesize);
                    // Restore properties
                    ebook.id = obj.id;
                    ebook.isAvailable = obj.isAvailable;
                    ebook.borrower = obj.borrower;
                    return ebook;
                } else {
                    // Create Book instance
                    const book = new Books(obj.title, obj.author);
                    // Restore properties
                    book.id = obj.id;
                    book.isAvailable = obj.isAvailable;
                    book.borrower = obj.borrower;
                    return book;
                }
            });
        }
    }
    displayBooks() {
        const booklist = document.querySelector("#book-list");
        booklist.innerHTML = "";
        if (this.books.length === 0) {
            booklist.innerHTML = "<p>No books in the library</p>"
            return;
        }
        let html = "";
        this.books.forEach((book) => {
            html += book.getHtml();
        });
        booklist.innerHTML = html;
        // book buttons borrow and return

        const cards = document.querySelectorAll(".book-card");
        cards.forEach((card) => {
            card.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", card.dataset.id);
                card.classList.add("dragging");
            });
            card.addEventListener("dragend", (e) => {
                card.classList.remove("dragging");
            });
        });
        // allow dropping in the list
        booklist.addEventListener("dragover", (e) => {
            e.preventDefault();
            const dragging = document.querySelector(".dragging");
            const afterElement = getDragAfterElement(booklist,e.clientX ,e.clientY);
            if (afterElement == null) {
                booklist.appendChild(dragging);
            } else {
                booklist.insertBefore(dragging, afterElement);
            }
        });

        // when dropped → update book order in array + save
        booklist.addEventListener("drop", () => {
            const newOrder = [...booklist.querySelectorAll(".book-card")].map(
                (c) => c.dataset.id
            );
            // reorder this.books according to DOM order
            this.books = newOrder.map((id) =>
                this.books.find((b) => String(b.id) === String(id))
            );
            this.saveBooks();
        });


        const bookBtns = document.querySelectorAll(".btn");
        bookBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                // const booklet = e.target.closest(".book-card").data.id;
                const card = btn.closest(".book-card");             //closests finds card div with selector
                let cardId = card.dataset.id;           // gets the id of the div
                let bookCard = this.books.find(b => String(b.id) === String(cardId));
                if (!bookCard) {
                    console.error("No matching book found for ID:", cardId);
                    return; // Stop if no book matches
                }
                if (btn.classList.contains("btn-borrow")) {
                    let name = prompt("Enter your name :");
                    if (!name) return;                           //cancel if empty
                    if (bookCard.isAvailable) {
                        bookCard.isAvailable = false;
                        bookCard.borrower = name;
                    }
                } else if (btn.classList.contains("btn-return")) {
                    bookCard.isAvailable = true;
                    bookCard.borrower = null;
                } else if (btn.classList.contains("btn-remove")) {
                    // console.log("Before remove", this.books);
                    // console.log("Removing book with id", cardId);
                    this.books = this.books.filter(b => String(b.id) !== String(cardId));
                    // console.log("After remove", this.books);
                    this.saveBooks();
                }
                this.saveBooks();
                this.displayBooks();
            });
        });

    }

}
function getDragAfterElement(container, x, y) {
    const draggableElements = [
        ...container.querySelectorAll(".book-card:not(.dragging)")
    ];

    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();

            // Distance from mouse pointer to the center of the element
            const offset = Math.hypot(
                x - (box.left + box.width / 2),
                y - (box.top + box.height / 2)
            );

            if (offset < closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.POSITIVE_INFINITY }
    ).element;
}



let myLibrary = new Library();
form.addEventListener("submit", (e) => {
    //prevent empty input       
    e.preventDefault();
    let title = document.querySelector("#title").value;
    let author = document.querySelector("#author").value;
    let type = select.value;

    // hold new book instances(object)
    let book;
    // create a book or ebook 
    if (type === "ebook") {
        // const size = filesize.value;
        book = new Ebook(title, author, filesize.value);
    } else {
        book = new Books(title, author);
    }
    myLibrary.addBook(book);
    // reset the form to default 
    form.reset();
    // hide the form again
    ebookDetails.style.display = "none";
});

myLibrary.displayBooks();
