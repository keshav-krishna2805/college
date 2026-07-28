from pathlib import Path

content = """API Documentation

Base URLs:
- /api/v1/auth
- /api/v1/clubs

Common headers:
- Content-Type: application/json
- Content-Type: multipart/form-data for profile image uploads
- Authorization: Bearer <token>
- or cookie: accessToken=<token>

Auth endpoints:
POST /api/v1/auth/student/register
Body: name, email, password, phoneNumber, rollNumber, branch, course, year

POST /api/v1/auth/student/login
Body: email, password

GET /api/v1/auth/student/profile
Auth: required

PUT /api/v1/auth/student/profile
Body: bio (optional) and/or profilePicture file
Auth: required

POST /api/v1/auth/organiser/register
Body: name, email, password, phoneNumber, rollNumber, branch, course, year

POST /api/v1/auth/organiser/login
Body: email, password

GET /api/v1/auth/organiser/profile
Auth: required

PUT /api/v1/auth/organiser/profile
Body: bio (optional) and/or profilePicture file
Auth: required

Club endpoints:
GET /api/v1/clubs
Auth: required

POST /api/v1/clubs
Body: name, description
Auth: required, organiser/admin only

GET /api/v1/clubs/:id
Auth: required

POST /api/v1/clubs/:id/join
Auth: required, student only
"""


def escape_pdf_text(text: str) -> str:
    return text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def build_pdf(text: str, out_path: str) -> None:
    lines = text.splitlines()
    if not lines:
        lines = ['']

    stream_parts = []
    stream_parts.append('BT')
    stream_parts.append('/F1 10 Tf')
    stream_parts.append('50 760 Td')

    for line in lines:
        escaped = escape_pdf_text(line)
        stream_parts.append(f'({escaped}) Tj')
        stream_parts.append('T*')

    stream_parts.append('ET')
    content_stream = '\n'.join(stream_parts).encode('latin-1')

    objects = []
    objects.append(b'<< /Type /Catalog /Pages 2 0 R >>')
    objects.append(b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
    objects.append(b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>')
    objects.append(f'<< /Length {len(content_stream)} >>\nstream\n'.encode('latin-1') + content_stream + b'\nendstream')
    objects.append(b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')

    pdf = bytearray(b'%PDF-1.4\n')
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(f'{len(objects) - 1} 0 obj\n'.encode('latin-1'))
        pdf.extend(obj)
        pdf.extend(b'\nendobj\n')

    # Rebuild with correct object numbering
    pdf = bytearray(b'%PDF-1.4\n')
    offsets = []
    objects_with_nums = []
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        objects_with_nums.append((i, obj))
        pdf.extend(f'{i} 0 obj\n'.encode('latin-1'))
        pdf.extend(obj)
        pdf.extend(b'\nendobj\n')

    xref_offset = len(pdf)
    pdf.extend(f'xref\n0 {len(objects_with_nums)+1}\n'.encode('latin-1'))
    pdf.extend(b'0000000000 65535 f \n')
    for offset in offsets:
        pdf.extend(f'{offset:010d} 00000 n \n'.encode('latin-1'))

    pdf.extend(f'trailer\n<< /Size {len(objects_with_nums)+1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n'.encode('latin-1'))
    Path(out_path).write_bytes(pdf)


if __name__ == '__main__':
    build_pdf(content, 'api_documentation.pdf')
    print('Created api_documentation.pdf')
