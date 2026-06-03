US ID: 8182
US Name: Display cashback tag in Round/Transaction History

Trong `Admin > User Games Play`, các cược được đặt trong thời gian user đang có bonus Cashback hoạt động phải được gắn tag `Cashback` tại cột `Bonus`.

Các cược này sẽ bị loại khỏi hệ thống tính cashback, vì vậy tag này giúp đội Ops dễ dàng nhận diện và kiểm tra.

## Phạm vi áp dụng

Tag `Cashback` tại cột `Bonus` được hiển thị cho:
- `Round History`
- `Transaction History`

Tag sẽ được hiển thị cho bất kỳ cược nào được đặt và thỏa điều kiện áp dụng cashback bonus.

## Điều kiện gắn cashback bonus trong cược

Phải thỏa mãn **đầy đủ** các điều kiện sau:
1. User đang tham gia cashback.
2. Cashback còn hiệu lực (được cấu hình ở admin).
3. Cược nằm trong phạm vi `Min <= Cược <= Max` (config min/max trong admin).
4. ~~Nếu cashback đã vượt quá số tiền tối đa hoàn trả thì không áp dụng cashback (dựa vào `% cashback / cược` và số max hoàn trả config ở admin).~~
5. Cashback đang ở trạng thái `active`.
6. Game tham gia cược được áp dụng cashback (config ở admin).

## Tiêu chí chấp nhận

- **AC1:** Trong `Round History`, cược được đặt khi bonus Cashback đang hoạt động sẽ hiển thị tag `Cashback` tại cột `Bonus`.
- **AC2:** Trong `Transaction History`, cùng cược đó sẽ hiển thị tag `Cashback` tại cột `Bonus` cho 2 loại cược txn "Win" và "Bet".
- **AC3:** Các cược được đặt trước khi bonus Cashback bắt đầu hoạt động hoặc sau khi bonus kết thúc/hết hạn sẽ **không** hiển thị tag `Cashback`.
- **AC4:** Các cược lịch sử (được tạo trước khi feature này release) không cần hiển thị tag.
- **AC5:** Áp dụng cho cả cược thắng và thua sao cho đáp ứng đủ điều kiện hiển thị cashback bonus.