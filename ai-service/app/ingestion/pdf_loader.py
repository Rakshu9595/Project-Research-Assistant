from pymupdf import filetype 
file_type_1 = filetype.guess('document.pdf', mime=True, extension=True)
file_type_2 = filetype.guess('document.docx', mime=True, extension=True)
file_type_3 = filetype.guess('document.pptx', mime=True, extension=True)

if file_type_1:
    print(f"File type of document.pdf: MIME type: {file_type_1[0]}, Extension: {file_type_1[1]}")